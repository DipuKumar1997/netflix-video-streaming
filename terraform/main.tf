terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region for media storage and distribution"
}

variable "project_name" {
  type        = string
  default     = "netflix-media-platform"
  description = "Name prefix for project infrastructure"
}

# Dynamic lookups for AWS Managed CloudFront Policies
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "cors_s3_origin" {
  name = "Managed-CORS-S3Origin"
}

# Lookup Managed CORS Response Headers Policy
data "aws_cloudfront_response_headers_policy" "cors_policy" {
  name = "Managed-CORS-With-Preflight"
}

# 1. Unique S3 Bucket Name Generator
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# 2. S3 Bucket for Media Storage
resource "aws_s3_bucket" "media_bucket" {
  bucket        = "${var.project_name}-${random_id.bucket_suffix.hex}"
  force_destroy = true
}

# 3. S3 CORS Configuration for HLS Streaming Playback (.m3u8 & .ts)
resource "aws_s3_bucket_cors_configuration" "media_cors" {
  bucket = aws_s3_bucket.media_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3600
  }
}

# 4. CloudFront Origin Access Control (OAC)
resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "${var.project_name}-oac"
  description                       = "OAC for Netflix S3 Media Origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 5. S3 Bucket Policy allowing CloudFront Read Access
resource "aws_s3_bucket_policy" "allow_cloudfront" {
  bucket = aws_s3_bucket.media_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipalReadOnly"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.media_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.media_cdn.arn
          }
        }
      }
    ]
  })
}

# 6. CloudFront CDN Distribution (Public Streaming)
resource "aws_cloudfront_distribution" "media_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Netflix Media CDN (Public Streaming)"
  default_root_object = ""

  origin {
    domain_name              = aws_s3_bucket.media_bucket.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.media_bucket.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.media_bucket.id}"

    # Referenced directly via data sources
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.cors_s3_origin.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.cors_policy.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Output parameters for Spring Boot application-prod.properties
output "AWS_REGION" {
  value       = var.aws_region
  description = "Set as AWS_REGION in production config"
}

output "AWS_S3_BUCKET" {
  value       = aws_s3_bucket.media_bucket.id
  description = "Set as AWS_S3_BUCKET in application-prod.properties"
}

output "AWS_CLOUDFRONT_DOMAIN" {
  value       = "https://${aws_cloudfront_distribution.media_cdn.domain_name}"
  description = "Set as AWS_CLOUDFRONT_DOMAIN in application-prod.properties"
}