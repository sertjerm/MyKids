-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 15, 2025 at 08:54 AM
-- Server version: 10.6.22-MariaDB-cll-lve
-- PHP Version: 8.3.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sertjerm_MyKids2`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`sertjerm_mykids`@`localhost` PROCEDURE `AddChildPoints` (IN `child_id` VARCHAR(4), IN `item_id` VARCHAR(4), IN `activity_type` ENUM('Good','Bad','Reward'), IN `points` INT, IN `note` TEXT)   BEGIN
    DECLARE activity_date DATE DEFAULT CURDATE();
    
    INSERT INTO DailyActivity (ItemId, ChildId, ActivityDate, ActivityType, EarnedPoints, Note, Status)
    VALUES (item_id, child_id, activity_date, activity_type, points, note, 'Approved');
    
    SELECT 'บันทึกสำเร็จ!' as Status, LAST_INSERT_ID() as ActivityId;
END$$

CREATE DEFINER=`sertjerm_mykids`@`localhost` PROCEDURE `GetChildStatistics` (IN `child_id` VARCHAR(4))   BEGIN
    SELECT 
        c.Id,
        c.FamilyId,
        c.Name,
        c.Age,
        c.Gender,
        c.AvatarPath,
        COALESCE(SUM(CASE WHEN da.EarnedPoints > 0 THEN da.EarnedPoints ELSE 0 END), 0) as TotalEarned,
        COALESCE(SUM(CASE WHEN da.EarnedPoints < 0 THEN ABS(da.EarnedPoints) ELSE 0 END), 0) as TotalSpent,
        COALESCE(SUM(da.EarnedPoints), 0) as CurrentPoints,
        COALESCE(COUNT(CASE WHEN da.ActivityType = 'Good' THEN 1 END), 0) as GoodCount,
        COALESCE(COUNT(CASE WHEN da.ActivityType = 'Bad' THEN 1 END), 0) as BadCount,
        COALESCE(COUNT(CASE WHEN da.ActivityType = 'Reward' THEN 1 END), 0) as RewardCount,
        COUNT(DISTINCT da.ActivityDate) as ActiveDays
    FROM Children c
    LEFT JOIN DailyActivity da ON c.Id = da.ChildId AND da.Status = 'Approved'
    WHERE c.Id = child_id
    GROUP BY c.Id, c.FamilyId, c.Name, c.Age, c.Gender, c.AvatarPath;
END$$

CREATE DEFINER=`sertjerm_mykids`@`localhost` PROCEDURE `GetDailyActivities` (IN `target_date` DATE, IN `child_id` VARCHAR(4))   BEGIN
    SELECT 
        da.*,
        c.Name as ChildName,
        CASE 
            WHEN da.ActivityType IN ('Good', 'Bad') THEN b.Name
            WHEN da.ActivityType = 'Reward' THEN r.Name
            ELSE 'Unknown'
        END as ItemName,
        CASE 
            WHEN da.ActivityType IN ('Good', 'Bad') THEN b.Category
            WHEN da.ActivityType = 'Reward' THEN r.Category
            ELSE NULL
        END as ItemCategory
    FROM DailyActivity da
    JOIN Children c ON da.ChildId = c.Id
    LEFT JOIN Behaviors b ON da.ItemId = b.Id AND da.ActivityType = b.Type
    LEFT JOIN Rewards r ON da.ItemId = r.Id AND da.ActivityType = 'Reward'
    WHERE da.ActivityDate = target_date
    AND (child_id IS NULL OR da.ChildId = child_id)
    AND da.Status = 'Approved'
    ORDER BY da.CreatedAt DESC;
END$$

CREATE DEFINER=`sertjerm_mykids`@`localhost` PROCEDURE `ResetTestData` ()   BEGIN
    DELETE FROM PointsHistory;
    DELETE FROM DailyActivity;
    ALTER TABLE DailyActivity AUTO_INCREMENT = 1;
    ALTER TABLE PointsHistory AUTO_INCREMENT = 1;
    
    SELECT 'ข้อมูลทดสอบถูกรีเซ็ตแล้ว!' as Status;
END$$

--
-- Functions
--
CREATE DEFINER=`sertjerm_mykids`@`localhost` FUNCTION `GetNextBehaviorId` () RETURNS VARCHAR(4) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Behaviors 
    WHERE Id LIKE 'B%';
    
    RETURN CONCAT('B', LPAD(next_num, 3, '0'));
END$$

CREATE DEFINER=`sertjerm_mykids`@`localhost` FUNCTION `GetNextChildId` () RETURNS VARCHAR(4) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Children 
    WHERE Id LIKE 'C%';
    
    RETURN CONCAT('C', LPAD(next_num, 3, '0'));
END$$

CREATE DEFINER=`sertjerm_mykids`@`localhost` FUNCTION `GetNextFamilyId` () RETURNS VARCHAR(4) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Families 
    WHERE Id LIKE 'F%';
    
    RETURN CONCAT('F', LPAD(next_num, 3, '0'));
END$$

CREATE DEFINER=`sertjerm_mykids`@`localhost` FUNCTION `GetNextRewardId` () RETURNS VARCHAR(4) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Rewards 
    WHERE Id LIKE 'R%';
    
    RETURN CONCAT('R', LPAD(next_num, 3, '0'));
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Behaviors`
--

CREATE TABLE `Behaviors` (
  `Id` varchar(4) NOT NULL COMMENT 'รหัสพฤติกรรม B001, B002, B003...',
  `FamilyId` varchar(4) NOT NULL COMMENT 'รหัสครอบครัวเจ้าของพฤติกรรม',
  `Name` varchar(200) NOT NULL COMMENT 'ชื่อพฤติกรรม',
  `Description` text DEFAULT NULL COMMENT 'รายละเอียดพฤติกรรม',
  `Points` int(11) NOT NULL COMMENT 'คะแนน (บวก=ดี, ลบ=ไม่ดี)',
  `Color` varchar(20) NOT NULL COMMENT 'สีประจำพฤติกรรม (HEX)',
  `Category` varchar(50) DEFAULT NULL COMMENT 'หมวดหมู่',
  `Type` enum('Good','Bad') NOT NULL COMMENT 'ประเภทพฤติกรรม',
  `IsRepeatable` tinyint(1) DEFAULT 0 COMMENT 'ทำซ้ำได้หรือไม่ (0=ครั้งเดียว, 1=ซ้ำได้)',
  `MaxPerDay` int(11) DEFAULT NULL COMMENT 'จำนวนครั้งสูงสุดต่อวัน',
  `IsActive` tinyint(1) DEFAULT 1 COMMENT 'สถานะใช้งาน',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่สร้าง',
  `UpdatedAt` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'วันที่แก้ไขล่าสุด'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางพฤติกรรม';

--
-- Dumping data for table `Behaviors`
--

INSERT INTO `Behaviors` (`Id`, `FamilyId`, `Name`, `Description`, `Points`, `Color`, `Category`, `Type`, `IsRepeatable`, `MaxPerDay`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
('B001', 'F001', 'แปรงฟัน', 'แปรงฟันเช้า-เย็น', 3, '#4ADE80', 'สุขภาพ', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B002', 'F001', 'เก็บของเล่น', 'เก็บของเล่นหลังเล่น', 2, '#60A5FA', 'ความรับผิดชอบ', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B003', 'F001', 'อ่านหนังสือ', 'อ่านหนังสือก่อนนอน', 5, '#A78BFA', 'การเรียนรู้', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B004', 'F001', 'ช่วยงานบ้าน', 'ช่วยงานบ้าน', 4, '#FBBF24', 'ความรับผิดชอบ', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B005', 'F001', 'ไหว้สวย', 'ไหว้สวยมาก', 8, '#FB7185', 'มารยาท', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B006', 'F001', 'พูดคำหยาบ', 'พูดคำหยาบคาย', -3, '#EF4444', 'มารยาท', 'Bad', 1, NULL, 1, '2025-09-15 08:47:55', NULL),
('B007', 'F001', 'โกหก', 'โกหกเรื่องต่างๆ', -5, '#DC2626', 'จริยธรรม', 'Bad', 1, NULL, 1, '2025-09-15 08:47:55', NULL),
('B008', 'F001', 'ขี้เกียจ', 'ไม่ยอมทำกิจกรรม', -2, '#F87171', 'พฤติกรรม', 'Bad', 1, NULL, 1, '2025-09-15 08:47:55', NULL),
('B009', 'F002', 'แปรงฟัน', 'แปรงฟันเช้า-เย็น', 3, '#4ADE80', 'สุขภาพ', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B010', 'F002', 'เก็บของเล่น', 'เก็บของเล่นหลังเล่น', 2, '#60A5FA', 'ความรับผิดชอบ', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B011', 'F002', 'ออกกำลังกาย', 'ออกกำลังกาย', 6, '#F472B6', 'สุขภาพ', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B012', 'F002', 'ช่วยแม่ทำอาหาร', 'ช่วยแม่ทำอาหาร', 5, '#FBBF24', 'ความรับผิดชอบ', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B013', 'F002', 'นอนตรงเวลา', 'นอนตรงเวลา', 4, '#A78BFA', 'สุขภาพ', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B014', 'F002', 'ทักทายสวัสดี', 'ทักทายสวัสดี', 2, '#FB7185', 'มารยาท', 'Good', 0, NULL, 1, '2025-09-15 08:47:55', NULL),
('B015', 'F002', 'หยุดเรียน', 'หยุดเรียนไม่มีเหตุผล', -6, '#B91C1C', 'การเรียนรู้', 'Bad', 1, NULL, 1, '2025-09-15 08:47:55', NULL),
('B016', 'F002', 'ไม่ล้างมือ', 'ไม่ล้างมือก่อนอาหาร', -2, '#F87171', 'สุขภาพ', 'Bad', 1, NULL, 1, '2025-09-15 08:47:55', NULL);

--
-- Triggers `Behaviors`
--
DELIMITER $$
CREATE TRIGGER `tr_behaviors_before_insert` BEFORE INSERT ON `Behaviors` FOR EACH ROW BEGIN
    IF NEW.Id IS NULL OR NEW.Id = '' THEN
        SET NEW.Id = GetNextBehaviorId();
    END IF;
    
    -- กำหนด IsRepeatable ตาม Type
    IF NEW.IsRepeatable IS NULL THEN
        IF NEW.Type = 'Good' THEN
            SET NEW.IsRepeatable = FALSE;
        ELSEIF NEW.Type = 'Bad' THEN
            SET NEW.IsRepeatable = TRUE;
        END IF;
    END IF;
    
    -- แก้ไข Points ให้ถูกต้อง (Good=บวก, Bad=ลบ)
    IF NEW.Type = 'Bad' AND NEW.Points > 0 THEN
        SET NEW.Points = -ABS(NEW.Points);
    ELSEIF NEW.Type = 'Good' AND NEW.Points < 0 THEN
        SET NEW.Points = ABS(NEW.Points);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Children`
--

CREATE TABLE `Children` (
  `Id` varchar(4) NOT NULL COMMENT 'รหัสเด็ก C001, C002, ...',
  `FamilyId` varchar(4) NOT NULL COMMENT 'รหัสครอบครัวที่เด็กสังกัด',
  `Name` varchar(100) NOT NULL COMMENT 'ชื่อเด็ก',
  `Age` int(11) DEFAULT NULL COMMENT 'อายุ',
  `Gender` enum('M','F','O') DEFAULT NULL COMMENT 'เพศ M=ชาย, F=หญิง, O=อื่นๆ',
  `AvatarPath` varchar(255) DEFAULT NULL COMMENT 'รูปประจำตัว (emoji หรือ path รูป)',
  `DateOfBirth` date DEFAULT NULL COMMENT 'วันเกิด',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่สร้าง',
  `UpdatedAt` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'วันที่แก้ไขล่าสุด',
  `IsActive` tinyint(1) DEFAULT 1 COMMENT 'สถานะใช้งาน'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลเด็ก';

--
-- Dumping data for table `Children`
--

INSERT INTO `Children` (`Id`, `FamilyId`, `Name`, `Age`, `Gender`, `AvatarPath`, `DateOfBirth`, `CreatedAt`, `UpdatedAt`, `IsActive`) VALUES
('C001', 'F001', 'น้องพีฟ่า', 11, 'F', '👧', '2013-05-15', '2025-09-15 08:47:55', NULL, 1),
('C002', 'F001', 'น้องพีฟอง', 10, 'M', '👦', '2014-08-20', '2025-09-15 08:47:55', NULL, 1),
('C003', 'F002', 'น้องมาริโอ้', 8, 'M', '👶', '2016-12-03', '2025-09-15 08:47:55', NULL, 1),
('C004', 'F002', 'น้องอย', 7, 'F', '👧', '2017-09-10', '2025-09-15 08:47:55', NULL, 1);

--
-- Triggers `Children`
--
DELIMITER $$
CREATE TRIGGER `tr_children_before_insert` BEFORE INSERT ON `Children` FOR EACH ROW BEGIN
    IF NEW.Id IS NULL OR NEW.Id = '' THEN
        SET NEW.Id = GetNextChildId();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `DailyActivity`
--

CREATE TABLE `DailyActivity` (
  `Id` int(11) NOT NULL COMMENT 'รหัสกิจกรรม',
  `ItemId` varchar(4) NOT NULL COMMENT 'รหัสพฤติกรรม (Bxxx) หรือรางวัล (Rxxx)',
  `ChildId` varchar(4) NOT NULL COMMENT 'รหัสเด็ก',
  `ActivityDate` date NOT NULL COMMENT 'วันที่ทำกิจกรรม',
  `ActivityType` enum('Good','Bad','Reward') NOT NULL COMMENT 'ประเภทกิจกรรม',
  `Count` int(11) DEFAULT 1 COMMENT 'จำนวนครั้ง',
  `EarnedPoints` int(11) NOT NULL COMMENT 'คะแนนที่ได้รับ/เสีย',
  `Note` text DEFAULT NULL COMMENT 'หมายเหตุเพิ่มเติม',
  `ApprovedBy` varchar(4) DEFAULT NULL COMMENT 'ผู้อนุมัติ (Family ID)',
  `ApprovedAt` datetime DEFAULT NULL COMMENT 'เวลาที่อนุมัติ',
  `Status` enum('Pending','Approved','Rejected') DEFAULT 'Approved' COMMENT 'สถานะ',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่บันทึก',
  `UpdatedAt` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'วันที่แก้ไขล่าสุด'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางกิจกรรมรายวัน - รวมพฤติกรรมและรางวัล';

--
-- Dumping data for table `DailyActivity`
--

INSERT INTO `DailyActivity` (`Id`, `ItemId`, `ChildId`, `ActivityDate`, `ActivityType`, `Count`, `EarnedPoints`, `Note`, `ApprovedBy`, `ApprovedAt`, `Status`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'B001', 'C001', '2024-12-15', 'Good', 1, 3, 'แปรงฟันเช้าแล้ว', NULL, NULL, 'Approved', '2025-09-15 08:47:55', NULL),
(2, 'B002', 'C001', '2024-12-15', 'Good', 1, 2, 'เก็บของเล่นหลังเล่น', NULL, NULL, 'Approved', '2025-09-15 08:47:55', NULL),
(3, 'B003', 'C001', '2024-12-15', 'Good', 1, 5, 'อ่านหนังสือก่อนนอน', NULL, NULL, 'Approved', '2025-09-15 08:47:55', NULL),
(4, 'B001', 'C002', '2024-12-15', 'Good', 1, 3, 'แปรงฟันเช้า', NULL, NULL, 'Approved', '2025-09-15 08:47:55', NULL),
(5, 'B004', 'C002', '2024-12-15', 'Good', 1, 4, 'ช่วยเก็บจาน', NULL, NULL, 'Approved', '2025-09-15 08:47:55', NULL),
(6, 'B006', 'C001', '2024-12-15', 'Bad', 1, -3, 'พูดคำหยาบกับน้อง', NULL, NULL, 'Approved', '2025-09-15 08:47:55', NULL),
(7, 'R001', 'C001', '2024-12-15', 'Reward', 1, -10, 'แลกไอศกรีม', NULL, NULL, 'Approved', '2025-09-15 08:47:55', NULL);

--
-- Triggers `DailyActivity`
--
DELIMITER $$
CREATE TRIGGER `tr_daily_activity_after_insert` AFTER INSERT ON `DailyActivity` FOR EACH ROW BEGIN
    DECLARE current_points INT DEFAULT 0;
    
    -- คำนวณคะแนนปัจจุบัน
    SELECT COALESCE(SUM(EarnedPoints), 0) INTO current_points
    FROM DailyActivity 
    WHERE ChildId = NEW.ChildId AND Status = 'Approved';
    
    -- บันทึกประวัติคะแนน
    INSERT INTO PointsHistory (ChildId, ActivityId, PointsBefore, PointsChange, PointsAfter)
    VALUES (NEW.ChildId, NEW.Id, current_points - NEW.EarnedPoints, NEW.EarnedPoints, current_points);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `Families`
--

CREATE TABLE `Families` (
  `Id` varchar(4) NOT NULL COMMENT 'รหัสครอบครัว F001, F002, ...',
  `Name` varchar(100) NOT NULL COMMENT 'ชื่อครอบครัว',
  `Password` varchar(255) NOT NULL COMMENT 'รหัสผ่านสำหรับเข้าสู่ระบบ',
  `Email` varchar(255) DEFAULT NULL COMMENT 'อีเมลติดต่อ',
  `Phone` varchar(20) DEFAULT NULL COMMENT 'เบอร์โทรติดต่อ',
  `AvatarPath` varchar(255) DEFAULT NULL COMMENT 'รูปประจำตัวครอบครัว',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่สร้าง',
  `UpdatedAt` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'วันที่แก้ไขล่าสุด',
  `IsActive` tinyint(1) DEFAULT 1 COMMENT 'สถานะใช้งาน'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลครอบครัว';

--
-- Dumping data for table `Families`
--

INSERT INTO `Families` (`Id`, `Name`, `Password`, `Email`, `Phone`, `AvatarPath`, `CreatedAt`, `UpdatedAt`, `IsActive`) VALUES
('F001', 'ครอบครัวสมิท', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'smith@example.com', '081-234-5678', '👨‍👩‍👧‍👦', '2025-09-15 08:47:55', NULL, 1),
('F002', 'ครอบครัวจอห์นสัน', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'johnson@example.com', '081-876-5432', '👨‍👩‍👧‍👦', '2025-09-15 08:47:55', NULL, 1);

--
-- Triggers `Families`
--
DELIMITER $$
CREATE TRIGGER `tr_families_before_insert` BEFORE INSERT ON `Families` FOR EACH ROW BEGIN
    IF NEW.Id IS NULL OR NEW.Id = '' THEN
        SET NEW.Id = GetNextFamilyId();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `PointsHistory`
--

CREATE TABLE `PointsHistory` (
  `Id` int(11) NOT NULL COMMENT 'รหัสประวัติ',
  `ChildId` varchar(4) NOT NULL COMMENT 'รหัสเด็ก',
  `ActivityId` int(11) NOT NULL COMMENT 'รหัสกิจกรรมอ้างอิง',
  `PointsBefore` int(11) NOT NULL COMMENT 'คะแนนก่อนหน้า',
  `PointsChange` int(11) NOT NULL COMMENT 'คะแนนที่เปลี่ยน',
  `PointsAfter` int(11) NOT NULL COMMENT 'คะแนนหลังเปลี่ยน',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่บันทึก'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางประวัติคะแนน';

--
-- Dumping data for table `PointsHistory`
--

INSERT INTO `PointsHistory` (`Id`, `ChildId`, `ActivityId`, `PointsBefore`, `PointsChange`, `PointsAfter`, `CreatedAt`) VALUES
(1, 'C001', 1, 0, 3, 3, '2025-09-15 08:47:55'),
(2, 'C001', 2, 3, 2, 5, '2025-09-15 08:47:55'),
(3, 'C001', 3, 5, 5, 10, '2025-09-15 08:47:55'),
(4, 'C002', 4, 0, 3, 3, '2025-09-15 08:47:55'),
(5, 'C002', 5, 3, 4, 7, '2025-09-15 08:47:55'),
(6, 'C001', 6, 10, -3, 7, '2025-09-15 08:47:55'),
(7, 'C001', 7, 7, -10, -3, '2025-09-15 08:47:55');

-- --------------------------------------------------------

--
-- Table structure for table `Rewards`
--

CREATE TABLE `Rewards` (
  `Id` varchar(4) NOT NULL COMMENT 'รหัสรางวัล R001, R002, ...',
  `FamilyId` varchar(4) NOT NULL COMMENT 'รหัสครอบครัวเจ้าของรางวัล',
  `Name` varchar(200) NOT NULL COMMENT 'ชื่อรางวัล',
  `Description` text DEFAULT NULL COMMENT 'รายละเอียดรางวัล',
  `Cost` int(11) NOT NULL COMMENT 'ราคาแลก (คะแนน)',
  `Color` varchar(20) NOT NULL COMMENT 'สีประจำรางวัล (HEX)',
  `Category` varchar(50) DEFAULT NULL COMMENT 'หมวดหมู่รางวัล',
  `ImagePath` varchar(255) DEFAULT NULL COMMENT 'รูปภาพรางวัล',
  `IsActive` tinyint(1) DEFAULT 1 COMMENT 'สถานะใช้งาน',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่สร้าง',
  `UpdatedAt` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'วันที่แก้ไขล่าสุด'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางรางวัล';

--
-- Dumping data for table `Rewards`
--

INSERT INTO `Rewards` (`Id`, `FamilyId`, `Name`, `Description`, `Cost`, `Color`, `Category`, `ImagePath`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
('R001', 'F001', 'ไอศกรีม', 'ไอศกรีมแท่งอร่อย', 10, '#FFE4E1', 'ขนม', NULL, 1, '2025-09-15 08:47:55', NULL),
('R002', 'F001', 'ดู YouTube 30 นาที', 'ดู YouTube นาน 30 นาที', 15, '#E6E6FA', 'บันเทิง', NULL, 1, '2025-09-15 08:47:55', NULL),
('R003', 'F001', 'ซื้อสติ๊กเกอร์', 'ซื้อสติ๊กเกอร์ชุดใหม่', 20, '#F0F8FF', 'ของเล่น', NULL, 1, '2025-09-15 08:47:55', NULL),
('R004', 'F001', 'ขนมเค้ก', 'ขนมเค้กชิ้นพิเศษ', 25, '#FFF8DC', 'ขนม', NULL, 1, '2025-09-15 08:47:55', NULL),
('R005', 'F001', 'ไปสวนสนุก', 'ไปเที่ยวสวนสนุก', 50, '#FFEFD5', 'กิจกรรม', NULL, 1, '2025-09-15 08:47:55', NULL),
('R006', 'F002', 'เล่นเกม 1 ชั่วโมง', 'เล่นเกมคอมพิวเตอร์ 1 ชั่วโมง', 30, '#E0E6FF', 'บันเทิง', NULL, 1, '2025-09-15 08:47:55', NULL),
('R007', 'F002', 'ซื้อของเล่นใหม่', 'ซื้อของเล่นใหม่', 80, '#FFE4B5', 'ของเล่น', NULL, 1, '2025-09-15 08:47:55', NULL),
('R008', 'F002', 'ไปหาเพื่อน', 'ไปเที่ยวกับเพื่อน', 35, '#E6FFE6', 'กิจกรรม', NULL, 1, '2025-09-15 08:47:55', NULL),
('R009', 'F002', 'ไปดูหนัง', 'ไปดูหนังที่โรงภาพยนตร์', 60, '#FFEBEE', 'บันเทิง', NULL, 1, '2025-09-15 08:47:55', NULL),
('R010', 'F002', 'ไม่ต้องล้างจาน 1 วัน', 'ได้สิทธิไม่ต้องล้างจาน', 40, '#F3E5F5', 'สิทธิพิเศษ', NULL, 1, '2025-09-15 08:47:55', NULL);

--
-- Triggers `Rewards`
--
DELIMITER $$
CREATE TRIGGER `tr_rewards_before_insert` BEFORE INSERT ON `Rewards` FOR EACH ROW BEGIN
    IF NEW.Id IS NULL OR NEW.Id = '' THEN
        SET NEW.Id = GetNextRewardId();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_BehaviorDailySummary`
-- (See below for the actual view)
--
CREATE TABLE `vw_BehaviorDailySummary` (
`Id` varchar(4)
,`FamilyId` varchar(4)
,`Name` varchar(200)
,`Points` int(11)
,`Color` varchar(20)
,`Category` varchar(50)
,`Type` enum('Good','Bad')
,`ChildId` varchar(4)
,`ActivityDate` date
,`CompletedChildrenCount` bigint(21)
,`TotalCount` decimal(32,0)
,`TotalPoints` decimal(42,0)
,`isCompleted` int(1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_ChildrenScores`
-- (See below for the actual view)
--
CREATE TABLE `vw_ChildrenScores` (
`Id` varchar(4)
,`FamilyId` varchar(4)
,`Name` varchar(100)
,`Age` int(11)
,`Gender` enum('M','F','O')
,`AvatarPath` varchar(255)
,`DateOfBirth` date
,`TotalPoints` decimal(32,0)
,`EarnedPoints` decimal(32,0)
,`DeductedPoints` decimal(32,0)
,`GoodBehaviorCount` decimal(32,0)
,`BadBehaviorCount` decimal(32,0)
,`RewardCount` decimal(32,0)
,`CreatedAt` datetime
,`IsActive` tinyint(1)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_FamilySummary`
-- (See below for the actual view)
--
CREATE TABLE `vw_FamilySummary` (
`Id` varchar(4)
,`Name` varchar(100)
,`Email` varchar(255)
,`Phone` varchar(20)
,`AvatarPath` varchar(255)
,`TotalChildren` bigint(21)
,`TotalBehaviors` bigint(21)
,`TotalRewards` bigint(21)
,`FamilyTotalPoints` decimal(54,0)
,`CreatedAt` datetime
,`IsActive` tinyint(1)
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Behaviors`
--
ALTER TABLE `Behaviors`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_behaviors_family` (`FamilyId`),
  ADD KEY `idx_behaviors_type` (`Type`),
  ADD KEY `idx_behaviors_active` (`IsActive`),
  ADD KEY `idx_behaviors_category` (`Category`);

--
-- Indexes for table `Children`
--
ALTER TABLE `Children`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_children_family` (`FamilyId`),
  ADD KEY `idx_children_active` (`IsActive`),
  ADD KEY `idx_children_name` (`Name`);

--
-- Indexes for table `DailyActivity`
--
ALTER TABLE `DailyActivity`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `uk_daily_activity_child_item_date` (`ChildId`,`ItemId`,`ActivityDate`),
  ADD KEY `idx_daily_activity_date` (`ActivityDate`),
  ADD KEY `idx_daily_activity_child` (`ChildId`),
  ADD KEY `idx_daily_activity_item` (`ItemId`),
  ADD KEY `idx_daily_activity_type` (`ActivityType`),
  ADD KEY `idx_daily_activity_child_date` (`ChildId`,`ActivityDate`);

--
-- Indexes for table `Families`
--
ALTER TABLE `Families`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `uk_families_email` (`Email`),
  ADD KEY `idx_families_active` (`IsActive`);

--
-- Indexes for table `PointsHistory`
--
ALTER TABLE `PointsHistory`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_points_history_child` (`ChildId`),
  ADD KEY `idx_points_history_activity` (`ActivityId`);

--
-- Indexes for table `Rewards`
--
ALTER TABLE `Rewards`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_rewards_family` (`FamilyId`),
  ADD KEY `idx_rewards_cost` (`Cost`),
  ADD KEY `idx_rewards_active` (`IsActive`),
  ADD KEY `idx_rewards_category` (`Category`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `DailyActivity`
--
ALTER TABLE `DailyActivity`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'รหัสกิจกรรม', AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `PointsHistory`
--
ALTER TABLE `PointsHistory`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'รหัสประวัติ', AUTO_INCREMENT=8;

-- --------------------------------------------------------

--
-- Structure for view `vw_BehaviorDailySummary`
--
DROP TABLE IF EXISTS `vw_BehaviorDailySummary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sertjerm_mykids`@`localhost` SQL SECURITY DEFINER VIEW `vw_BehaviorDailySummary`  AS SELECT `b`.`Id` AS `Id`, `b`.`FamilyId` AS `FamilyId`, `b`.`Name` AS `Name`, `b`.`Points` AS `Points`, `b`.`Color` AS `Color`, `b`.`Category` AS `Category`, `b`.`Type` AS `Type`, `d`.`ChildId` AS `ChildId`, `d`.`ActivityDate` AS `ActivityDate`, count(distinct `d`.`ChildId`) AS `CompletedChildrenCount`, sum(coalesce(`d`.`Count`,0)) AS `TotalCount`, sum(coalesce(`d`.`Count`,0)) * `b`.`Points` AS `TotalPoints`, CASE WHEN count(`d`.`ChildId`) > 0 THEN 1 ELSE 0 END AS `isCompleted` FROM (`Behaviors` `b` left join `DailyActivity` `d` on(`b`.`Id` = `d`.`ItemId` and `d`.`ActivityType` = `b`.`Type` and `d`.`Status` = 'Approved')) WHERE `b`.`IsActive` = 1 GROUP BY `b`.`Id`, `b`.`FamilyId`, `b`.`Name`, `b`.`Points`, `b`.`Color`, `b`.`Category`, `b`.`Type`, `d`.`ChildId`, `d`.`ActivityDate` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_ChildrenScores`
--
DROP TABLE IF EXISTS `vw_ChildrenScores`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sertjerm_mykids`@`localhost` SQL SECURITY DEFINER VIEW `vw_ChildrenScores`  AS SELECT `c`.`Id` AS `Id`, `c`.`FamilyId` AS `FamilyId`, `c`.`Name` AS `Name`, `c`.`Age` AS `Age`, `c`.`Gender` AS `Gender`, `c`.`AvatarPath` AS `AvatarPath`, `c`.`DateOfBirth` AS `DateOfBirth`, coalesce(`scores`.`TotalPoints`,0) AS `TotalPoints`, coalesce(`scores`.`EarnedPoints`,0) AS `EarnedPoints`, coalesce(`scores`.`DeductedPoints`,0) AS `DeductedPoints`, coalesce(`counts`.`GoodBehaviorCount`,0) AS `GoodBehaviorCount`, coalesce(`counts`.`BadBehaviorCount`,0) AS `BadBehaviorCount`, coalesce(`counts`.`RewardCount`,0) AS `RewardCount`, `c`.`CreatedAt` AS `CreatedAt`, `c`.`IsActive` AS `IsActive` FROM ((`Children` `c` left join (select `DailyActivity`.`ChildId` AS `ChildId`,sum(case when `DailyActivity`.`EarnedPoints` > 0 then `DailyActivity`.`EarnedPoints` else 0 end) AS `EarnedPoints`,sum(case when `DailyActivity`.`EarnedPoints` < 0 then abs(`DailyActivity`.`EarnedPoints`) else 0 end) AS `DeductedPoints`,sum(`DailyActivity`.`EarnedPoints`) AS `TotalPoints` from `DailyActivity` where `DailyActivity`.`Status` = 'Approved' group by `DailyActivity`.`ChildId`) `scores` on(`c`.`Id` = `scores`.`ChildId`)) left join (select `DailyActivity`.`ChildId` AS `ChildId`,sum(case when `DailyActivity`.`ActivityType` = 'Good' then `DailyActivity`.`Count` else 0 end) AS `GoodBehaviorCount`,sum(case when `DailyActivity`.`ActivityType` = 'Bad' then `DailyActivity`.`Count` else 0 end) AS `BadBehaviorCount`,sum(case when `DailyActivity`.`ActivityType` = 'Reward' then `DailyActivity`.`Count` else 0 end) AS `RewardCount` from `DailyActivity` where `DailyActivity`.`Status` = 'Approved' group by `DailyActivity`.`ChildId`) `counts` on(`c`.`Id` = `counts`.`ChildId`)) WHERE `c`.`IsActive` = 1 ;

-- --------------------------------------------------------

--
-- Structure for view `vw_FamilySummary`
--
DROP TABLE IF EXISTS `vw_FamilySummary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sertjerm_mykids`@`localhost` SQL SECURITY DEFINER VIEW `vw_FamilySummary`  AS SELECT `f`.`Id` AS `Id`, `f`.`Name` AS `Name`, `f`.`Email` AS `Email`, `f`.`Phone` AS `Phone`, `f`.`AvatarPath` AS `AvatarPath`, count(distinct `c`.`Id`) AS `TotalChildren`, count(distinct `b`.`Id`) AS `TotalBehaviors`, count(distinct `r`.`Id`) AS `TotalRewards`, coalesce(sum(`cs`.`TotalPoints`),0) AS `FamilyTotalPoints`, `f`.`CreatedAt` AS `CreatedAt`, `f`.`IsActive` AS `IsActive` FROM ((((`Families` `f` left join `Children` `c` on(`f`.`Id` = `c`.`FamilyId` and `c`.`IsActive` = 1)) left join `Behaviors` `b` on(`f`.`Id` = `b`.`FamilyId` and `b`.`IsActive` = 1)) left join `Rewards` `r` on(`f`.`Id` = `r`.`FamilyId` and `r`.`IsActive` = 1)) left join `vw_ChildrenScores` `cs` on(`c`.`Id` = `cs`.`Id`)) WHERE `f`.`IsActive` = 1 GROUP BY `f`.`Id`, `f`.`Name`, `f`.`Email`, `f`.`Phone`, `f`.`AvatarPath`, `f`.`CreatedAt`, `f`.`IsActive` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Behaviors`
--
ALTER TABLE `Behaviors`
  ADD CONSTRAINT `fk_behaviors_family` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `Children`
--
ALTER TABLE `Children`
  ADD CONSTRAINT `fk_children_family` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `DailyActivity`
--
ALTER TABLE `DailyActivity`
  ADD CONSTRAINT `fk_daily_activity_child` FOREIGN KEY (`ChildId`) REFERENCES `Children` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `PointsHistory`
--
ALTER TABLE `PointsHistory`
  ADD CONSTRAINT `fk_points_history_activity` FOREIGN KEY (`ActivityId`) REFERENCES `DailyActivity` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_points_history_child` FOREIGN KEY (`ChildId`) REFERENCES `Children` (`Id`) ON DELETE CASCADE;

--
-- Constraints for table `Rewards`
--
ALTER TABLE `Rewards`
  ADD CONSTRAINT `fk_rewards_family` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
