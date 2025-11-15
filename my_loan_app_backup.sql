-- MySQL dump 10.13  Distrib 9.5.0, for macos26.0 (arm64)
--
-- Host: localhost    Database: my_loan_app
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '7db24518-ba43-11f0-a6f1-b40602f6cf28:1-1760';

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=266 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 01:46:42','2025-11-12 01:46:42'),(2,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 01:46:43','2025-11-12 01:46:43'),(3,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 01:46:44','2025-11-12 01:46:44'),(4,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 01:46:45','2025-11-12 01:46:45'),(5,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 01:46:47','2025-11-12 01:46:47'),(6,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 01:46:50','2025-11-12 01:46:50'),(7,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 01:46:55','2025-11-12 01:46:55'),(8,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:15:06','2025-11-12 02:15:06'),(9,1,NULL,'super@admin.com','Created User','Superadmin created benny (admin).','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:19:33','2025-11-12 02:19:33'),(10,11,NULL,'benny@admin.com','Created Loan','Loan # created for Kennzy','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:24:15','2025-11-12 02:24:15'),(11,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:24:47','2025-11-12 02:24:47'),(12,11,NULL,'benny@admin.com','Viewed Loan Report','Loan #1 viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:24:50','2025-11-12 02:24:50'),(13,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:24:52','2025-11-12 02:24:52'),(14,11,NULL,'benny@admin.com','Recorded Payment','₵1002.00 received for Loan #','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:25:31','2025-11-12 02:25:31'),(15,11,NULL,'benny@admin.com','Recorded Payment','₵500.00 received for Loan #','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:25:50','2025-11-12 02:25:50'),(16,11,NULL,'benny@admin.com','Recorded Payment','₵502.00 received for Loan #','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:26:25','2025-11-12 02:26:25'),(17,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 02:30:51','2025-11-12 02:30:51'),(18,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 10:44:05','2025-11-12 10:44:05'),(19,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:20:32','2025-11-12 11:20:32'),(20,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:20:32','2025-11-12 11:20:32'),(21,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:20:33','2025-11-12 11:20:33'),(22,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:20:41','2025-11-12 11:20:41'),(23,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:20:41','2025-11-12 11:20:41'),(24,1,NULL,'super@admin.com','Editing Customer Login','Superadmin opened edit form for Kennzy','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:21:12','2025-11-12 11:21:12'),(25,1,NULL,'super@admin.com','Updated Customer Login','Superadmin updated Kennzy\'s login info.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:21:31','2025-11-12 11:21:31'),(26,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:21:31','2025-11-12 11:21:31'),(27,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:21:32','2025-11-12 11:21:32'),(28,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:21:33','2025-11-12 11:21:33'),(29,1,NULL,'super@admin.com','Editing Customer Login','Superadmin opened edit form for Kennzy','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:21:38','2025-11-12 11:21:38'),(30,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:22:34','2025-11-12 11:22:34'),(31,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:22:34','2025-11-12 11:22:34'),(32,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:22:35','2025-11-12 11:22:35'),(33,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:22:44','2025-11-12 11:22:44'),(34,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:22:44','2025-11-12 11:22:44'),(35,1,NULL,'super@admin.com','Editing Customer Login','Superadmin opened edit form for Kennzy','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:24:32','2025-11-12 11:24:32'),(36,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:29:28','2025-11-12 11:29:28'),(37,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:29:28','2025-11-12 11:29:28'),(38,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:29:29','2025-11-12 11:29:29'),(39,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:29:29','2025-11-12 11:29:29'),(40,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:29:35','2025-11-12 11:29:35'),(41,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:29:35','2025-11-12 11:29:35'),(42,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:30:46','2025-11-12 11:30:46'),(43,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:30:47','2025-11-12 11:30:47'),(44,11,NULL,'benny@admin.com','Recorded Payment','₵1002.00 received for Loan #','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:31:13','2025-11-12 11:31:13'),(45,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:31:37','2025-11-12 11:31:37'),(46,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:31:37','2025-11-12 11:31:37'),(47,1,NULL,'super@admin.com','Editing Customer Login','Superadmin opened edit form for Kennzy','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:31:46','2025-11-12 11:31:46'),(48,1,NULL,'super@admin.com','Updated Customer Login','Superadmin updated Kennzy2\'s login info.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:33:45','2025-11-12 11:33:45'),(49,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:33:45','2025-11-12 11:33:45'),(50,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:33:45','2025-11-12 11:33:45'),(51,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:33:46','2025-11-12 11:33:46'),(52,1,NULL,'super@admin.com','Editing Customer Login','Superadmin opened edit form for Kennzy2','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:33:49','2025-11-12 11:33:49'),(53,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:33:57','2025-11-12 11:33:57'),(54,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:33:57','2025-11-12 11:33:57'),(55,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:33:58','2025-11-12 11:33:58'),(56,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy2','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:34:00','2025-11-12 11:34:00'),(57,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:34:00','2025-11-12 11:34:00'),(58,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy2','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:48:23','2025-11-12 11:48:23'),(59,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:48:28','2025-11-12 11:48:28'),(60,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy2','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:57:40','2025-11-12 11:57:40'),(61,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 11:57:45','2025-11-12 11:57:45'),(62,1,NULL,'super@admin.com','Editing Customer Login','Superadmin opened edit form for Kennzy2','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:00:24','2025-11-12 12:00:24'),(63,1,NULL,'super@admin.com','Updated Customer Login','Superadmin updated Kennzy2\'s login info.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:00:39','2025-11-12 12:00:39'),(64,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:00:39','2025-11-12 12:00:39'),(65,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:00:39','2025-11-12 12:00:39'),(66,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:00:40','2025-11-12 12:00:40'),(67,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy2','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:02:19','2025-11-12 12:02:19'),(68,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:02:24','2025-11-12 12:02:24'),(69,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy2','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:16:42','2025-11-12 12:16:42'),(70,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:16:48','2025-11-12 12:16:48'),(71,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:21:55','2025-11-12 12:21:55'),(72,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:21:55','2025-11-12 12:21:55'),(73,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:27:59','2025-11-12 12:27:59'),(74,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:27:59','2025-11-12 12:27:59'),(75,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy2','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:29:12','2025-11-12 12:29:12'),(76,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 12:29:19','2025-11-12 12:29:19'),(77,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 13:20:02','2025-11-12 13:20:02'),(78,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 13:20:02','2025-11-12 13:20:02'),(79,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 13:20:03','2025-11-12 13:20:03'),(80,1,NULL,'super@admin.com','Resent Customer Credentials','Superadmin resent credentials to Kennzy2','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 13:20:05','2025-11-12 13:20:05'),(81,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 13:20:10','2025-11-12 13:20:10'),(82,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 13:34:11','2025-11-12 13:34:11'),(83,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 13:34:12','2025-11-12 13:34:12'),(84,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 13:40:30','2025-11-12 13:40:30'),(85,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 13:40:31','2025-11-12 13:40:31'),(86,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 19:18:37','2025-11-12 19:18:37'),(87,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 19:23:30','2025-11-12 19:23:30'),(88,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:15:18','2025-11-12 20:15:18'),(89,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:19:25','2025-11-12 20:19:25'),(90,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:19:29','2025-11-12 20:19:29'),(91,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:22:08','2025-11-12 20:22:08'),(92,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:22:30','2025-11-12 20:22:30'),(93,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:24:51','2025-11-12 20:24:51'),(94,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:24:53','2025-11-12 20:24:53'),(95,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:25:17','2025-11-12 20:25:17'),(96,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:25:27','2025-11-12 20:25:27'),(97,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:25:58','2025-11-12 20:25:58'),(98,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:26:05','2025-11-12 20:26:05'),(99,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 20:27:21','2025-11-12 20:27:21'),(100,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 21:07:14','2025-11-12 21:07:14'),(101,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 21:09:16','2025-11-12 21:09:16'),(102,11,NULL,'benny@admin.com','Recorded Payment','₵1002.00 received for Loan #','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 21:16:07','2025-11-12 21:16:07'),(103,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 21:35:05','2025-11-12 21:35:05'),(104,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-12 22:08:37','2025-11-12 22:08:37'),(105,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 21:01:01','2025-11-13 21:01:01'),(106,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 22:50:44','2025-11-13 22:50:44'),(107,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 22:50:46','2025-11-13 22:50:46'),(108,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 22:50:48','2025-11-13 22:50:48'),(109,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 23:06:47','2025-11-13 23:06:47'),(110,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 23:06:51','2025-11-13 23:06:51'),(111,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 23:07:02','2025-11-13 23:07:02'),(112,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 23:07:06','2025-11-13 23:07:06'),(113,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 23:07:10','2025-11-13 23:07:10'),(114,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 23:16:59','2025-11-13 23:16:59'),(115,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 23:18:48','2025-11-13 23:18:48'),(116,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 23:41:15','2025-11-13 23:41:15'),(117,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-13 23:41:21','2025-11-13 23:41:21'),(118,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:04:31','2025-11-14 00:04:31'),(119,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:04:40','2025-11-14 00:04:40'),(120,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:04:42','2025-11-14 00:04:42'),(121,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:04:46','2025-11-14 00:04:46'),(122,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:09:43','2025-11-14 00:09:43'),(123,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:10:14','2025-11-14 00:10:14'),(124,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:10:18','2025-11-14 00:10:18'),(125,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:11:06','2025-11-14 00:11:06'),(126,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:15:31','2025-11-14 00:15:31'),(127,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:15:35','2025-11-14 00:15:35'),(128,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:15:41','2025-11-14 00:15:41'),(129,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:15:45','2025-11-14 00:15:45'),(130,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:19:55','2025-11-14 00:19:55'),(131,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:20:22','2025-11-14 00:20:22'),(132,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:20:32','2025-11-14 00:20:32'),(133,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:20:37','2025-11-14 00:20:37'),(134,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:20:39','2025-11-14 00:20:39'),(135,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:20:45','2025-11-14 00:20:45'),(136,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:24:58','2025-11-14 00:24:58'),(137,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:34:09','2025-11-14 00:34:09'),(138,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:38:19','2025-11-14 00:38:19'),(139,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:38:20','2025-11-14 00:38:20'),(140,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:38:21','2025-11-14 00:38:21'),(141,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:38:45','2025-11-14 00:38:45'),(142,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:38:45','2025-11-14 00:38:45'),(143,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:46:09','2025-11-14 00:46:09'),(144,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:46:52','2025-11-14 00:46:52'),(145,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:46:58','2025-11-14 00:46:58'),(146,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:47:01','2025-11-14 00:47:01'),(147,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:47:11','2025-11-14 00:47:11'),(148,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:52:13','2025-11-14 00:52:13'),(149,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:52:14','2025-11-14 00:52:14'),(150,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:56:17','2025-11-14 00:56:17'),(151,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:56:26','2025-11-14 00:56:26'),(152,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:56:46','2025-11-14 00:56:46'),(153,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:56:47','2025-11-14 00:56:47'),(154,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:58:46','2025-11-14 00:58:46'),(155,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:58:47','2025-11-14 00:58:47'),(156,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:58:47','2025-11-14 00:58:47'),(157,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 00:58:48','2025-11-14 00:58:48'),(158,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:29:24','2025-11-14 03:29:24'),(159,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:29:34','2025-11-14 03:29:34'),(160,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:29:43','2025-11-14 03:29:43'),(161,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:29:51','2025-11-14 03:29:51'),(162,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:29:51','2025-11-14 03:29:51'),(163,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:30:29','2025-11-14 03:30:29'),(164,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:30:33','2025-11-14 03:30:33'),(165,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:33:32','2025-11-14 03:33:32'),(166,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:33:41','2025-11-14 03:33:41'),(167,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:35:08','2025-11-14 03:35:08'),(168,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:35:11','2025-11-14 03:35:11'),(169,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:16','2025-11-14 03:38:16'),(170,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:16','2025-11-14 03:38:16'),(171,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:17','2025-11-14 03:38:17'),(172,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:18','2025-11-14 03:38:18'),(173,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:18','2025-11-14 03:38:18'),(174,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:18','2025-11-14 03:38:18'),(175,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:25','2025-11-14 03:38:25'),(176,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:26','2025-11-14 03:38:26'),(177,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:28','2025-11-14 03:38:28'),(178,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:56','2025-11-14 03:38:56'),(179,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:38:56','2025-11-14 03:38:56'),(180,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:40:16','2025-11-14 03:40:16'),(181,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:40:25','2025-11-14 03:40:25'),(182,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:40:26','2025-11-14 03:40:26'),(183,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:40:28','2025-11-14 03:40:28'),(184,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:40:30','2025-11-14 03:40:30'),(185,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:40:32','2025-11-14 03:40:32'),(186,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:40:39','2025-11-14 03:40:39'),(187,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:41:00','2025-11-14 03:41:00'),(188,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:41:00','2025-11-14 03:41:00'),(189,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:41:02','2025-11-14 03:41:02'),(190,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:41:02','2025-11-14 03:41:02'),(191,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:41:05','2025-11-14 03:41:05'),(192,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:41:06','2025-11-14 03:41:06'),(193,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:41:06','2025-11-14 03:41:06'),(194,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:46:09','2025-11-14 03:46:09'),(195,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:46:09','2025-11-14 03:46:09'),(196,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:46:10','2025-11-14 03:46:10'),(197,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:47:17','2025-11-14 03:47:17'),(198,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:47:17','2025-11-14 03:47:17'),(199,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:47:18','2025-11-14 03:47:18'),(200,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:48:41','2025-11-14 03:48:41'),(201,1,NULL,'super@admin.com','Viewed Loan Report','Loan #1 viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:48:46','2025-11-14 03:48:46'),(202,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:48:46','2025-11-14 03:48:46'),(203,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:48:46','2025-11-14 03:48:46'),(204,1,NULL,'super@admin.com','Viewed Loan Report','Loan #1 viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:50:11','2025-11-14 03:50:11'),(205,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:50:21','2025-11-14 03:50:21'),(206,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:50:23','2025-11-14 03:50:23'),(207,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:50:29','2025-11-14 03:50:29'),(208,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:50:29','2025-11-14 03:50:29'),(209,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:50:37','2025-11-14 03:50:37'),(210,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:56:10','2025-11-14 03:56:10'),(211,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:56:11','2025-11-14 03:56:11'),(212,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:56:15','2025-11-14 03:56:15'),(213,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:56:17','2025-11-14 03:56:17'),(214,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:56:23','2025-11-14 03:56:23'),(215,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:56:27','2025-11-14 03:56:27'),(216,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:56:27','2025-11-14 03:56:27'),(217,11,NULL,'benny@admin.com','Created Loan','Loan # created for Test Customer','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:57:43','2025-11-14 03:57:43'),(218,11,NULL,'benny@admin.com','Recorded Payment','₵858.00 received for Loan #','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:58:20','2025-11-14 03:58:20'),(219,11,NULL,'benny@admin.com','Recorded Payment','₵858.00 received for Loan #','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:58:37','2025-11-14 03:58:37'),(220,11,NULL,'benny@admin.com','Recorded Payment','₵500.00 received for Loan #','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 03:58:57','2025-11-14 03:58:57'),(221,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 04:00:01','2025-11-14 04:00:01'),(222,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 04:00:01','2025-11-14 04:00:01'),(223,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 04:00:29','2025-11-14 04:00:29'),(224,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 04:00:29','2025-11-14 04:00:29'),(225,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 04:01:24','2025-11-14 04:01:24'),(226,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 04:01:27','2025-11-14 04:01:27'),(227,1,NULL,'super@admin.com','Created User','Superadmin created staff (staff).','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 08:15:40','2025-11-14 08:15:40'),(228,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 08:17:55','2025-11-14 08:17:55'),(229,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:10:52','2025-11-14 09:10:52'),(230,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:10:54','2025-11-14 09:10:54'),(231,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:23:35','2025-11-14 09:23:35'),(232,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:23:37','2025-11-14 09:23:37'),(233,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:23:40','2025-11-14 09:23:40'),(234,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:23:41','2025-11-14 09:23:41'),(235,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:24:08','2025-11-14 09:24:08'),(236,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:24:12','2025-11-14 09:24:12'),(237,1,NULL,'super@admin.com','Viewed Manage Customers','Superadmin viewed manage customers list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:24:13','2025-11-14 09:24:13'),(238,1,NULL,'super@admin.com','Viewed Customers','Superadmin viewed customer list.','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:24:14','2025-11-14 09:24:14'),(239,1,NULL,'super@admin.com','Viewed Reports','Reports dashboard viewed by Super Admin 101','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:24:15','2025-11-14 09:24:15'),(240,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:25:53','2025-11-14 09:25:53'),(241,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:36:29','2025-11-14 09:36:29'),(242,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:36:53','2025-11-14 09:36:53'),(243,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 09:48:42','2025-11-14 09:48:42'),(244,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:09:59','2025-11-14 10:09:59'),(245,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:17:02','2025-11-14 10:17:02'),(246,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:24:06','2025-11-14 10:24:06'),(247,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:24:17','2025-11-14 10:24:17'),(248,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:30:43','2025-11-14 10:30:43'),(249,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:36:06','2025-11-14 10:36:06'),(250,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:36:08','2025-11-14 10:36:08'),(251,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:36:11','2025-11-14 10:36:11'),(252,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:36:31','2025-11-14 10:36:31'),(253,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:36:32','2025-11-14 10:36:32'),(254,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:36:33','2025-11-14 10:36:33'),(255,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:36:34','2025-11-14 10:36:34'),(256,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:37:55','2025-11-14 10:37:55'),(257,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:38:13','2025-11-14 10:38:13'),(258,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:50:18','2025-11-14 10:50:18'),(259,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:50:29','2025-11-14 10:50:29'),(260,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 10:50:44','2025-11-14 10:50:44'),(261,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 12:04:33','2025-11-14 12:04:33'),(262,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 12:04:42','2025-11-14 12:04:42'),(263,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 12:19:04','2025-11-14 12:19:04'),(264,11,NULL,'benny@admin.com','Viewed Reports','Reports dashboard viewed by benny','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 13:37:36','2025-11-14 13:37:36'),(265,12,NULL,'staff@admin.com','Viewed Reports','Reports dashboard viewed by staff','127.0.0.1','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','2025-11-14 14:02:09','2025-11-14 14:02:09');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clauses`
--

DROP TABLE IF EXISTS `clauses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clauses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clauses`
--

LOCK TABLES `clauses` WRITE;
/*!40000 ALTER TABLE `clauses` DISABLE KEYS */;
/*!40000 ALTER TABLE `clauses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `full_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marital_status` enum('single','married') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('M','F') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `id_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `house_no` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `community` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `workplace` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profession` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employer` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_branch` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_bank_loan` tinyint(1) NOT NULL DEFAULT '0',
  `bank_monthly_deduction` decimal(10,2) DEFAULT NULL,
  `take_home` decimal(10,2) DEFAULT NULL,
  `loan_amount_requested` decimal(10,2) DEFAULT NULL,
  `loan_purpose` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `total_loans` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_paid` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_remaining` decimal(12,2) NOT NULL DEFAULT '0.00',
  `active_loans_count` int NOT NULL DEFAULT '0',
  `last_loan_date` timestamp NULL DEFAULT NULL,
  `agreement` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agreement_path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `current_session_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_email_unique` (`email`),
  KEY `customers_current_session_id_index` (`current_session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'active','Kennzy2','233507115736','kenzy@gmail.com',NULL,NULL,'married','M',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,3000.00,'fees',NULL,3000.00,4008.00,1002.00,1,'2025-11-12 02:24:15',NULL,NULL,'2025-11-12 02:23:10','2025-11-12 21:16:07',NULL,NULL),(2,'active','Test Customer','233507115736','testcustomer@example.com','$2y$12$Gk1MMcb7N2.9WKxEYmF4zeMmh5B292SxYsi95WntT16QELtD/y0xm',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,2200.00,2216.00,1216.00,1,'2025-11-14 03:57:43',NULL,NULL,'2025-11-12 15:53:35','2025-11-14 03:58:57',NULL,NULL);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_failures`
--

DROP TABLE IF EXISTS `email_failures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_failures` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `recipient` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loan_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_failures`
--

LOCK TABLES `email_failures` WRITE;
/*!40000 ALTER TABLE `email_failures` DISABLE KEYS */;
/*!40000 ALTER TABLE `email_failures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guarantors`
--

DROP TABLE IF EXISTS `guarantors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guarantors` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `loan_id` bigint unsigned DEFAULT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `occupation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `residence` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guarantors_name_contact_unique` (`name`,`contact`),
  KEY `guarantors_customer_id_foreign` (`customer_id`),
  KEY `guarantors_loan_id_foreign` (`loan_id`),
  CONSTRAINT `guarantors_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `guarantors_loan_id_foreign` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guarantors`
--

LOCK TABLES `guarantors` WRITE;
/*!40000 ALTER TABLE `guarantors` DISABLE KEYS */;
/*!40000 ALTER TABLE `guarantors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_schedules`
--

DROP TABLE IF EXISTS `loan_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loan_schedules` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `loan_id` bigint unsigned NOT NULL,
  `payment_number` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT '0.00',
  `amount_left` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_paid` tinyint(1) NOT NULL DEFAULT '0',
  `paid_at` timestamp NULL DEFAULT NULL,
  `due_date` date NOT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `loan_schedules_loan_id_foreign` (`loan_id`),
  CONSTRAINT `loan_schedules_loan_id_foreign` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_schedules`
--

LOCK TABLES `loan_schedules` WRITE;
/*!40000 ALTER TABLE `loan_schedules` DISABLE KEYS */;
INSERT INTO `loan_schedules` VALUES (1,1,1,1002.00,1002.00,0.00,1,NULL,'2025-12-12','Cleared ✅','2025-11-12 02:24:15','2025-11-12 02:25:28'),(2,1,2,1002.00,1002.00,0.00,1,NULL,'2026-01-12','Cleared ✅','2025-11-12 02:24:15','2025-11-12 02:26:24'),(3,1,3,1002.00,1002.00,0.00,1,NULL,'2026-02-12','Cleared ✅','2025-11-12 02:24:15','2025-11-12 11:31:11'),(4,1,4,1002.00,1002.00,0.00,1,NULL,'2026-03-12','Cleared ✅','2025-11-12 02:24:15','2025-11-12 21:16:05'),(5,1,5,1002.00,0.00,1002.00,0,NULL,'2026-04-12','Pending','2025-11-12 02:24:15','2025-11-12 02:24:15'),(6,2,1,858.00,858.00,0.00,1,NULL,'2025-12-14','Cleared ✅','2025-11-14 03:57:43','2025-11-14 03:58:16'),(7,2,2,858.00,858.00,0.00,1,NULL,'2026-01-14','Cleared ✅','2025-11-14 03:57:43','2025-11-14 03:58:33'),(8,2,3,858.00,500.00,358.00,0,NULL,'2026-02-14','Partial — ₵358.00 left','2025-11-14 03:57:43','2025-11-14 03:58:55'),(9,2,4,858.00,0.00,858.00,0,NULL,'2026-03-14','Pending','2025-11-14 03:57:43','2025-11-14 03:57:43');
/*!40000 ALTER TABLE `loan_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `client_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `expected_interest` decimal(12,2) DEFAULT '0.00',
  `interest_rate` decimal(5,2) DEFAULT '35.00',
  `term_months` int DEFAULT '1',
  `start_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `amount_paid` decimal(12,2) DEFAULT '0.00',
  `amount_remaining` decimal(12,2) DEFAULT '0.00',
  `disbursed_at` timestamp NULL DEFAULT NULL,
  `interest_earned` decimal(12,2) DEFAULT '0.00',
  `total_with_interest` decimal(12,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `loans_user_id_foreign` (`user_id`),
  KEY `loans_customer_id_foreign` (`customer_id`),
  CONSTRAINT `loans_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `loans_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
INSERT INTO `loans` VALUES (1,11,1,'Kennzy',3000.00,2010.00,20.00,5,'2025-11-12','2026-04-12','active',4008.00,1002.00,NULL,0.00,5010.00,NULL,'2025-11-12 02:24:15','2025-11-12 21:16:07',NULL),(2,11,2,'Test Customer',2200.00,1232.00,20.00,4,'2025-11-14','2026-03-14','active',2216.00,1216.00,NULL,0.00,3432.00,NULL,'2025-11-14 03:57:43','2025-11-14 03:58:57',NULL);
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2025_09_25_000001_create_customers_table',1),(5,'2025_09_26_000001_create_loans_table',1),(6,'2025_09_28_000001_create_guarantors_table',1),(7,'2025_09_28_000001_create_loan_schedules_table',1),(8,'2025_09_28_220900_add_client_name_to_loans_table',1),(9,'2025_09_29_000000_add_due_date_to_loans_table',1),(10,'2025_09_29_000001_create_payments_table',1),(11,'2025_09_29_094328_add_customer_id_to_loans_table',1),(12,'2025_09_30_000001_create_settings_table',1),(13,'2025_09_30_094211_make_loan_id_nullable_in_guarantors_table',1),(14,'2025_09_30_120941_create_clauses_table',1),(15,'2025_10_01_000001_create_activity_logs_table',1),(16,'2025_10_01_010308_add_received_by_to_payments_table',1),(17,'2025_10_03_175351_add_status_to_customers_table',1),(18,'2025_10_03_193521_remove_logo_from_settings_table',1),(19,'2025_10_04_222756_add_method_and_meta_to_payments_table',1),(20,'2025_10_05_170132_add_phone_to_users_table',1),(21,'2025_10_05_200326_create_sms_logs_table',1),(22,'2025_10_08_212036_add_paid_at_to_loan_schedules_table',1),(23,'2025_10_08_232816_add_note_to_loan_schedules_table',1),(24,'2025_10_10_112925_add_username_to_users_table',1),(25,'2025_10_17_230844_create_email_failures_table',1),(26,'2025_10_18_225445_add_remaining_payment_to_loan_schedules_table',1),(27,'2025_10_18_235453_add_amount_tracking_to_loans_table',1),(28,'2025_10_19_004436_add_closed_at_to_loans_table',1),(29,'2025_10_24_181143_add_timestamps_to_email_failures_table',1),(30,'2025_10_25_012414_create_sms_logs_table',1),(31,'2025_10_25_225351_ensure_is_paid_exists_in_loan_schedules_table',1),(32,'2025_10_26_114018_rename_remaining_amount_to_installment_balance_in_loan_schedules_table',1),(33,'2025_11_07_132848_add_total_with_interest_to_loans_table',2),(34,'2025_11_07_133128_add_total_with_interest_to_loans_table',3),(35,'2025_11_07_172506_sync_loan_data_and_schedules',4),(36,'2025_11_08_094641_add_extra_fields_to_customers_table',5),(37,'2025_11_08_150244_update_customers_remove_unique_email',6),(38,'2025_11_08_152355_add_unique_constraint_to_guarantors',7),(39,'2025_11_08_152451_restore_unique_email_on_customers',8),(40,'2025_11_08_164324_sync_existing_customers_to_users',9),(41,'2025_11_11_113011_add_deleted_at_to_loans_table',10),(42,'2025_11_11_120604_add_deleted_at_to_customers_table',11),(43,'2025_11_11_123650_add_defaults_and_constraints_to_loans_table',12),(44,'2025_11_11_144439_add_loan_summary_fields_to_customers_table',13),(45,'2025_11_12_110837_add_current_session_id_to_customers_table',14),(46,'2025_11_12_164519_add_password_to_customers_table',15);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `loan_id` bigint unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `processor` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `paid_at` date NOT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `received_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_loan_id_foreign` (`loan_id`),
  KEY `payments_paid_at_index` (`paid_at`),
  KEY `payments_received_by_foreign` (`received_by`),
  CONSTRAINT `payments_loan_id_foreign` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_received_by_foreign` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,1002.00,'cash',NULL,NULL,'2025-11-12',NULL,'Installment #1 due Dec 12, 2025',11,'2025-11-12 02:25:28','2025-11-12 02:25:28'),(2,1,500.00,'cash',NULL,NULL,'2025-11-12',NULL,'Installment #2 due Jan 12, 2026',11,'2025-11-12 02:25:49','2025-11-12 02:25:49'),(3,1,502.00,'cash',NULL,NULL,'2025-11-12',NULL,'Installment #2 due Jan 12, 2026',11,'2025-11-12 02:26:24','2025-11-12 02:26:24'),(4,1,1002.00,'cash',NULL,NULL,'2025-11-12',NULL,'Installment #3 due Feb 12, 2026',11,'2025-11-12 11:31:11','2025-11-12 11:31:11'),(5,1,1002.00,'cash',NULL,NULL,'2025-11-12',NULL,'Installment #4 due Mar 12, 2026',11,'2025-11-12 21:16:05','2025-11-12 21:16:05'),(6,2,858.00,'cash',NULL,NULL,'2025-11-14',NULL,'Installment #1 due Dec 14, 2025',11,'2025-11-14 03:58:16','2025-11-14 03:58:16'),(7,2,858.00,'cash',NULL,NULL,'2025-11-14',NULL,'Installment #2 due Jan 14, 2026',11,'2025-11-14 03:58:33','2025-11-14 03:58:33'),(8,2,500.00,'cash',NULL,NULL,'2025-11-14',NULL,'Installment #3 due Feb 14, 2026',11,'2025-11-14 03:58:55','2025-11-14 03:58:55');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_interest_rate` decimal(5,2) NOT NULL DEFAULT '20.00',
  `default_term_months` int NOT NULL DEFAULT '3',
  `default_penalty_rate` decimal(5,2) NOT NULL DEFAULT '0.50',
  `grace_period_days` int NOT NULL DEFAULT '0',
  `allow_early_repayment` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'JOELAAR MICRO-CREDIT','Box 112','0246096706','Joelaar2.test@yahoo.com','GCB',NULL,'JOE LAAR','CEO',20.00,4,0.50,0,1,'2025-11-05 13:26:57','2025-11-11 14:36:33');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_logs`
--

DROP TABLE IF EXISTS `sms_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sms_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sent',
  `error` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sms_logs_phone_index` (`phone`),
  KEY `sms_logs_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_logs`
--

LOCK TABLES `sms_logs` WRITE;
/*!40000 ALTER TABLE `sms_logs` DISABLE KEYS */;
INSERT INTO `sms_logs` VALUES (1,'233246096706','Hi benny, your JLMC account has been created.\nEmail: benny@admin.com\nPassword: 123456789\nLogin: http://127.0.0.1:8000/login','sent',NULL,'2025-11-12 02:19:41','2025-11-12 02:19:41'),(2,'233507115736','Hi Kennzy, payment of ₵1,002.00 received for your loan #1. Remaining balance: ₵4,008.00','sent',NULL,'2025-11-12 02:25:31','2025-11-12 02:25:31'),(3,'233507115736','Hi Kennzy, payment of ₵500.00 received for your loan #1. Remaining balance: ₵3,508.00','sent',NULL,'2025-11-12 02:25:50','2025-11-12 02:25:50'),(4,'233507115736','Hi Kennzy, payment of ₵502.00 received for your loan #1. Remaining balance: ₵3,006.00','sent',NULL,'2025-11-12 02:26:25','2025-11-12 02:26:25'),(5,'233507115736','Hi Kennzy, payment of ₵1,002.00 received for your loan #1. Remaining balance: ₵2,004.00','sent',NULL,'2025-11-12 11:31:13','2025-11-12 11:31:13'),(6,'233507115736','Hi Kennzy2, your login credentials have been reset.\nEmail: kenzy@gmail.com\nPassword: dniwZoIp\nLogin: http://127.0.0.1:8000/login','sent',NULL,'2025-11-12 11:48:28','2025-11-12 11:48:28'),(7,'233507115736','Hi Kennzy2, your login credentials have been reset.\nEmail: kenzy@gmail.com\nPassword: dVZDaSLR\nLogin: http://127.0.0.1:8000/login','sent',NULL,'2025-11-12 11:57:44','2025-11-12 11:57:44'),(8,'233507115736','Hi Kennzy2, your login credentials have been reset.\nEmail: kenzy@gmail.com\nPassword: ulf6of3H\nLogin: http://127.0.0.1:8000/login','sent',NULL,'2025-11-12 12:02:24','2025-11-12 12:02:24'),(9,'233507115736','Hi Kennzy2, your login credentials have been reset.\nEmail: kenzy@gmail.com\nPassword: hxCpNzUC\nLogin: http://127.0.0.1:8000/login','sent',NULL,'2025-11-12 12:16:47','2025-11-12 12:16:47'),(10,'233507115736','Hi Kennzy2, your login credentials have been reset.\nEmail: kenzy@gmail.com\nPassword: mAL9ncPO\nLogin: http://127.0.0.1:8000/login','sent',NULL,'2025-11-12 12:29:19','2025-11-12 12:29:19'),(11,'233507115736','Hi Kennzy2, your login credentials have been reset.\nEmail: kenzy@gmail.com\nPassword: BG8zYZRx\nLogin: http://127.0.0.1:8000/login','sent',NULL,'2025-11-12 13:20:10','2025-11-12 13:20:10'),(12,'233507115736','Hi Kennzy2, payment of ₵1,002.00 received for your loan #1. Remaining balance: ₵1,002.00','sent',NULL,'2025-11-12 21:16:07','2025-11-12 21:16:07'),(13,'233507115736','Hi Test Customer, your loan of ₵2,200.00 has been created and activated. Loan Code: .','sent',NULL,'2025-11-14 03:57:50','2025-11-14 03:57:50'),(14,'233507115736','Hi Test Customer, payment of ₵858.00 received for your loan #2. Remaining balance: ₵2,574.00','sent',NULL,'2025-11-14 03:58:19','2025-11-14 03:58:19'),(15,'233507115736','Hi Test Customer, payment of ₵858.00 received for your loan #2. Remaining balance: ₵1,716.00','sent',NULL,'2025-11-14 03:58:37','2025-11-14 03:58:37'),(16,'233507115736','Hi Test Customer, payment of ₵500.00 received for your loan #2. Remaining balance: ₵1,216.00','sent',NULL,'2025-11-14 03:58:57','2025-11-14 03:58:57');
/*!40000 ALTER TABLE `sms_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_super_admin` tinyint(1) NOT NULL DEFAULT '0',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Super Admin 101','sup-super-admin-118','super@admin.com','233246096706',NULL,'$2y$12$XCgfKTtz11IAqTxFHrKeiewtvrjKYi1ll.ZfcH5QEXkMvzPDzGHvO','superadmin',1,'HgalhHG962Z7i12JNm3IIIKr3A4Uax0gdfzqSFHrJ1B8W5b44r4qAm8IdHcO','2025-11-05 12:35:30','2025-11-11 20:52:01'),(11,'benny','adm-benny-948','benny@admin.com','233246096706',NULL,'$2y$12$7wvBMxLJxUqyB6L4pweQG.dFN4heQfyYadDs3/m/kJC1Ah1D.mLCu','admin',0,NULL,'2025-11-12 02:19:33','2025-11-12 02:19:33'),(12,'staff','stf-staff-571','staff@admin.com','233507115736',NULL,'$2y$12$3xlt8dCZxiueft.AuaAlg./UhkU/unrLPq5l6f.nYjjrqovwZsr0S','staff',0,NULL,'2025-11-14 08:15:40','2025-11-14 08:15:40');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-15 15:14:06
