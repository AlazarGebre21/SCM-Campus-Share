package storage

import (
	"bytes"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/campus-share/backend/internal/config"
)

// S3Storage implements cloud storage using AWS S3 or S3-compatible services
type S3Storage struct {
	client     *s3.S3
	bucketName string
}

// NewS3Storage creates a new S3 storage instance
func NewS3Storage(cfg *config.AWSConfig) (*S3Storage, error) {
	awsConfig := &aws.Config{
		Region:      aws.String(cfg.Region),
		Credentials: credentials.NewStaticCredentials(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
	}

	// If endpoint is provided, use it (for MinIO or custom S3-compatible services)
	if cfg.Endpoint != "" {
		awsConfig.Endpoint = aws.String(cfg.Endpoint)
		awsConfig.S3ForcePathStyle = aws.Bool(true) // Required for MinIO
	}

	sess, err := session.NewSession(awsConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS session: %w", err)
	}

	return &S3Storage{
		client:     s3.New(sess),
		bucketName: cfg.BucketName,
	}, nil
}

// UploadFile uploads a file to S3 and returns the object key
func (s *S3Storage) UploadFile(key string, file io.Reader, contentType string, fileSize int64) error {
	// Read the file into bytes to convert io.Reader to io.ReadSeeker
	data, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("failed to read file: %w", err)
	}

	_, err = s.client.PutObject(&s3.PutObjectInput{
		Bucket:        aws.String(s.bucketName),
		Key:           aws.String(key),
		Body:          bytes.NewReader(data),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(fileSize),
	})

	if err != nil {
		return fmt.Errorf("failed to upload file to S3: %w", err)
	}

	return nil
}

// UploadFileFromBytes uploads a file from bytes to S3
func (s *S3Storage) UploadFileFromBytes(key string, data []byte, contentType string) error {
	return s.UploadFile(key, bytes.NewReader(data), contentType, int64(len(data)))
}

// GetPresignedURL generates a presigned URL for downloading a file
func (s *S3Storage) GetPresignedURL(key string, expiration time.Duration) (string, error) {
	req, _ := s.client.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})

	url, err := req.Presign(expiration)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return url, nil
}

// DeleteFile deletes a file from S3
func (s *S3Storage) DeleteFile(key string) error {
	_, err := s.client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})

	if err != nil {
		return fmt.Errorf("failed to delete file from S3: %w", err)
	}

	return nil
}

// FileExists checks if a file exists in S3
func (s *S3Storage) FileExists(key string) (bool, error) {
	_, err := s.client.HeadObject(&s3.HeadObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})

	if err != nil {
		// Check if it's a "not found" error
		if aerr, ok := err.(awserr.Error); ok {
			if aerr.Code() == "NotFound" || aerr.Code() == s3.ErrCodeNoSuchKey {
				return false, nil
			}
		}
		return false, err
	}

	return true, nil
}

// GenerateKey generates a unique S3 key for a file
func GenerateKey(userID, resourceID, fileName string) string {
	return fmt.Sprintf("resources/%s/%s/%s", userID, resourceID, fileName)
}
