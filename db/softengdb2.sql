-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 23, 2025 at 02:26 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `softengdb2`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
CREATE TABLE IF NOT EXISTS `admin` (
  `adminId` int NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `fname` varchar(50) NOT NULL,
  `lname` varchar(50) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  PRIMARY KEY (`adminId`),
  UNIQUE KEY `idNumber` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`adminId`, `email`, `fname`, `lname`, `passwordHash`) VALUES
(1, '111@email.com', 'Sir', 'Dennis', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'),
(2, '112@email.com', 'Mark', 'Nicolas', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'),
(3, '113@email.com', 'Ysac', 'Beset', '2873c302aea10e9a0d51662019901b990dd9e1baae43062223d0c3220133b686');
-- ============================================
-- UPDATED EQUIPMENT TABLE WITH NEW COLUMNS
-- ============================================

DROP TABLE IF EXISTS `equipment`;
CREATE TABLE IF NOT EXISTS `equipment` (
  `equipmentId` int NOT NULL AUTO_INCREMENT,
  `equipmentName` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  `available` int NOT NULL,
  `status` varchar(20) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `condition` varchar(20) DEFAULT 'Good',
  `description` text,
  PRIMARY KEY (`equipmentId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`equipmentId`, `equipmentName`, `quantity`, `available`, `status`, `category`, `brand`, `condition`, `description`) VALUES
(1, 'Projector', 3, 3, 'Available', 'Presentation', 'Epson EB-X41', 'Good', 'Portable projector for presentations and classroom use'),
(2, 'Laptop', 5, 5, 'Available', 'Computers', 'Dell Latitude 5420', 'Good', 'Business laptops for student use with Windows 11'),
(3, 'HDMI Cable', 10, 10, 'Available', 'Cables & Accessories', 'Generic', 'Good', 'Standard HDMI cables for connectivity, 2 meters length');
-- --------------------------------------------------------

--
-- Table structure for table `equipmentreservation`
--

DROP TABLE IF EXISTS `equipmentreservation`;
CREATE TABLE IF NOT EXISTS `equipmentreservation` (
  `reservationId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `equipmentId` int NOT NULL,
  `date` date NOT NULL,
  `startTime` time(6) NOT NULL,
  `endTime` time(6) NOT NULL,
  `dueDate` date NOT NULL,
  `status` varchar(20) NOT NULL,
  `purpose` varchar(50) NOT NULL,
  PRIMARY KEY (`reservationId`),
  KEY `userId` (`userId`),
  KEY `equipmentId` (`equipmentId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `equipmentreservation`
--

INSERT INTO `equipmentreservation` (`reservationId`, `userId`, `equipmentId`, `date`, `startTime`, `endTime`, `dueDate`, `status`, `purpose`) VALUES
(1, 2, 1, '2025-10-18', '08:00:00.000000', '10:00:00.000000', '2025-10-19', 'Approved', 'Class report'),
(2, 3, 2, '2025-10-19', '10:00:00.000000', '12:00:00.000000', '2025-10-19', 'Pending', 'Project demo');

-- --------------------------------------------------------

--
-- Table structure for table `printlog`
--

DROP TABLE IF EXISTS `printlog`;
CREATE TABLE IF NOT EXISTS `printlog` (
  `printId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `date` date NOT NULL,
  `time` time(6) NOT NULL,
  `purpose` varchar(50) NOT NULL,
  PRIMARY KEY (`printId`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `printlog`
--

INSERT INTO `printlog` (`printId`, `userId`, `date`, `time`, `purpose`) VALUES
(1, 1, '2025-10-16', '10:00:00.000000', 'Printed thesis draft'),
(2, 2, '2025-10-17', '14:30:00.000000', 'Printed project report'),
(3, 3, '2025-10-17', '15:10:00.000000', 'Printed lab worksheet');

-- --------------------------------------------------------

--
-- Table structure for table `request`
--

DROP TABLE IF EXISTS `request`;
CREATE TABLE IF NOT EXISTS `request` (
  `requestId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `reservationId` int NOT NULL,
  `status` varchar(20) NOT NULL,
  `requestType` varchar(20) NOT NULL,
  PRIMARY KEY (`requestId`),
  KEY `userId` (`userId`),
  KEY `reservationId` (`reservationId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `request`
--

INSERT INTO `request` (`requestId`, `userId`, `reservationId`, `status`, `requestType`) VALUES
(1, 2, 1, 'Approved', 'equipment'),
(2, 3, 1, 'Approved', 'room'),
(3, 2, 2, 'Pending', 'room'),
(4, 3, 2, 'Pending', 'equipment');

-- ============================================
-- UPDATED ROOM TABLE WITH NEW COLUMNS
-- ============================================

DROP TABLE IF EXISTS `room`;
CREATE TABLE IF NOT EXISTS `room` (
  `roomId` int NOT NULL AUTO_INCREMENT,
  `roomName` varchar(50) NOT NULL,
  `status` varchar(20) NOT NULL,
  `capacity` int NOT NULL,
  `building` varchar(100) DEFAULT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `equipment` text,
  `description` text,
  PRIMARY KEY (`roomId`),
  UNIQUE KEY `roomName` (`roomName`)   -- Required for FK
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`roomId`, `roomName`, `status`, `capacity`, `building`, `floor`, `equipment`, `description`) VALUES
(1, '423', 'Available', 40, 'Fr. Seraphin Devesse Building', '1st Floor', 'Projector, Whiteboard, 40 Computers, Air Conditioning', 'Computer laboratory with modern desktop computers for programming and general use'),
(2, '422', 'Reserved', 35, 'Fr. Seraphin Devesse Building', '2nd Floor', 'Smart Board, 35 Computers, Projector, Sound System', 'Computer laboratory equipped with smart board and multimedia capabilities'),
(3, 'CL3', 'Available', 30, 'Fr. Seraphin Devesse Building', '3rd Floor', 'Projector, Interactive Display, 30 Computers, Printer', 'Advanced computer laboratory for specialized courses and research'),
(4, '424', 'Available', 15, 'Fr. Seraphin Devesse Building', '4th Floor', '30 Computers, Printer', 'Advanced computer laboratory for specialized courses and research'),
(5, '426', 'Available', 15, 'Fr. Seraphin Devesse Building', '4th Floor', '30 Computers, Printer', 'Advanced computer laboratory for specialized courses and research');

-- --------------------------------------------------------

--
-- Table structure for table `roomreservation`
--

DROP TABLE IF EXISTS `roomreservation`;
CREATE TABLE IF NOT EXISTS `roomreservation` (
  `reservationId` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `roomId` int NOT NULL,
  `date` date NOT NULL,
  `startTime` time(6) NOT NULL,
  `endTime` time(6) NOT NULL,
  `capacityUsed` int NOT NULL,
  `status` varchar(20) NOT NULL,
  `purpose` varchar(50) NOT NULL,
  PRIMARY KEY (`reservationId`),
  KEY `userId` (`userId`),
  KEY `roomId` (`roomId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roomreservation`
--

INSERT INTO `roomreservation` (`reservationId`, `userId`, `roomId`, `date`, `startTime`, `endTime`, `capacityUsed`, `status`, `purpose`) VALUES
(1, 3, 1, '2025-10-18', '09:00:00.000000', '11:00:00.000000', 20, 'Approved', 'Group study'),
(2, 2, 2, '2025-10-19', '13:00:00.000000', '15:00:00.000000', 15, 'Pending', 'Presentation practice');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `userId` int NOT NULL AUTO_INCREMENT,
  `idNumber` int NOT NULL,
  `fname` varchar(20) NOT NULL,
  `lname` varchar(20) NOT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `idNumber`, `fname`, `lname`) VALUES
(1, 2240696, 'Josh', 'Bautista'),
(2, 2240712, 'Maria', 'Santos'),
(3, 2240755, 'John', 'Cruz'),
(4, 2240790, 'Prof', 'Villanueva');


-- --------------------------------------------------------

--
-- Table structure for table `BYODlog`
--
DROP TABLE IF EXISTS `BYODlog`;
CREATE TABLE IF NOT EXISTS `BYODlog` (
  `idLog` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `date` date NOT NULL,
  `timeIn` time(6) NOT NULL,
  `timeOut` time(6) DEFAULT NULL,
  `roomName` varchar(50) NOT NULL,
  PRIMARY KEY (`idLog`),
  KEY `userId` (`userId`),
  KEY `roomName` (`roomName`),
  CONSTRAINT `fk_byodlog_room`
    FOREIGN KEY (`roomName`) REFERENCES `room` (`roomName`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `BYODlog`
--

INSERT INTO `BYODlog` (`idLog`, `userId`, `date`, `timeIn`, `timeOut`, `roomName`) VALUES
(1, 1, '2025-10-16', '09:15:00.000000', '11:30:00.000000', '426'),
(2, 2, '2025-10-16', '09:45:00.000000', '12:10:00.000000', '426'),
(3, 3, '2025-10-17', '10:30:00.000000', '12:00:00.000000', '426'),
(4, 1, '2025-10-18', '08:55:00.000000', '10:45:00.000000', '426'),
(5, 4, '2025-10-18', '13:20:00.000000', '15:00:00.000000', '426');
-- --------------------------------------------------------

--
-- Table structure for table `KnowledgeCenterlog`
--
DROP TABLE IF EXISTS `KnowledgeCenterlog`;
CREATE TABLE IF NOT EXISTS `KnowledgeCenterlog` (
  `idLog` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `date` date NOT NULL,
  `timeIn` time(6) NOT NULL,
  `timeOut` time(6) DEFAULT NULL,
  `roomName` varchar(50) NOT NULL,
  PRIMARY KEY (`idLog`),
  KEY `userId` (`userId`),
  KEY `roomName` (`roomName`),
  CONSTRAINT `fk_kclog_room`
    FOREIGN KEY (`roomName`) REFERENCES `room` (`roomName`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `KnowledgeCenterlog`
--

INSERT INTO `KnowledgeCenterlog` (`idLog`, `userId`, `date`, `timeIn`, `timeOut`, `roomName`) VALUES
(1, 4, '2025-10-16', '09:10:00.000000', '11:00:00.000000', '424'),
(2, 3, '2025-10-16', '10:00:00.000000', '12:30:00.000000', '424'),
(3, 2, '2025-10-17', '08:45:00.000000', '10:15:00.000000', '424'),
(4, 1, '2025-10-18', '14:00:00.000000', '16:10:00.000000', '424'),
(5, 1, '2025-10-19', '09:25:00.000000', '11:50:00.000000', '424');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `equipmentreservation`
--
ALTER TABLE `equipmentreservation`
  ADD CONSTRAINT `FKequipId` FOREIGN KEY (`equipmentId`) REFERENCES `equipment` (`equipmentId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FKuserIdEquipRes` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `BYODlog`
--
ALTER TABLE `BYODlog`
  ADD CONSTRAINT `FKuserIdBYOD`
    FOREIGN KEY (`userId`) REFERENCES `users` (`userId`)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FKroomNameBYOD`
    FOREIGN KEY (`roomName`) REFERENCES `room` (`roomName`)
    ON DELETE RESTRICT ON UPDATE CASCADE;
--
--
-- Constraints for table `KnowledgeCenterlog`
--
ALTER TABLE `KnowledgeCenterlog`
  ADD CONSTRAINT `FKuserIdKC`
    FOREIGN KEY (`userId`) REFERENCES `users` (`userId`)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FKroomNameKC`
    FOREIGN KEY (`roomName`) REFERENCES `room` (`roomName`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `printlog`
--
ALTER TABLE `printlog`
  ADD CONSTRAINT `FKuserIdPrint` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `request`
--
ALTER TABLE `request`
  ADD CONSTRAINT `FKreserveIdEquip` FOREIGN KEY (`reservationId`) REFERENCES `equipmentreservation` (`reservationId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FKuserIdReq` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `roomreservation`
--
ALTER TABLE `roomreservation`
  ADD CONSTRAINT `FKroomId` FOREIGN KEY (`roomId`) REFERENCES `room` (`roomId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `FKuserIdRoomRes` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
