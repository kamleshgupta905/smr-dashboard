-- ========================================================
-- Complete Database Dump: u839355029_api
-- Generated At: 20261021_073208
-- Host: srv2215.hstgr.io
-- ========================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET NAMES utf8mb4;

-- --------------------------------------------------------
-- Table structure for `api_surveys`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `api_surveys`;
CREATE TABLE `api_surveys` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `SurveyId` varchar(255) NOT NULL,
  `Name` varchar(255) DEFAULT NULL,
  `TotalCompleteRequired` int(11) DEFAULT 0,
  `CPI` decimal(10,2) DEFAULT 0.00,
  `LOI` int(11) DEFAULT 0,
  `IR` int(11) DEFAULT 0,
  `LastUpdateTimeStamp` datetime DEFAULT NULL,
  `IsSurveyGroupExist` int(11) DEFAULT 0,
  `LanguageCode` varchar(50) DEFAULT NULL,
  `SurveyEndDate` datetime DEFAULT NULL,
  `Device` varchar(255) DEFAULT NULL,
  `IndustryId` int(11) DEFAULT NULL,
  `StudyTypes` varchar(255) DEFAULT NULL,
  `IsRecontactSurvey` int(11) DEFAULT 0,
  `CollectPII` int(11) DEFAULT 0,
  `LanguageId` int(11) DEFAULT NULL,
  `FieldDays` int(11) DEFAULT NULL,
  `SurveyCreatedAt` datetime DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_surveys_surveyid_unique` (`SurveyId`)
) ENGINE=InnoDB AUTO_INCREMENT=3067 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `api_surveys` (1097 rows)
