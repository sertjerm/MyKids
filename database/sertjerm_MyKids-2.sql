-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 13, 2025 at 07:19 PM
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
-- Database: `sertjerm_MyKids`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`sertjerm_mykids`@`localhost` PROCEDURE `GetChildStatistics` (IN `child_id` VARCHAR(4))   BEGIN
    SELECT 
        c.Id,
        c.Name,
        c.Age,
        COALESCE(SUM(CASE WHEN da.EarnedPoints > 0 THEN da.EarnedPoints ELSE 0 END), 0) as TotalEarned,
        COALESCE(SUM(CASE WHEN da.EarnedPoints < 0 THEN ABS(da.EarnedPoints) ELSE 0 END), 0) as TotalSpent,
        COALESCE(SUM(da.EarnedPoints), 0) as CurrentPoints,
        COALESCE(COUNT(CASE WHEN da.ActivityType = 'Good' THEN 1 END), 0) as GoodCount,
        COALESCE(COUNT(CASE WHEN da.ActivityType = 'Bad' THEN 1 END), 0) as BadCount,
        COALESCE(COUNT(CASE WHEN da.ActivityType = 'Reward' THEN 1 END), 0) as RewardCount,
        COUNT(DISTINCT da.ActivityDate) as ActiveDays
    FROM Children c
    LEFT JOIN DailyActivity da ON c.Id = da.ChildId
    WHERE c.Id = child_id
    GROUP BY c.Id, c.Name, c.Age;
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
    ORDER BY da.CreatedAt DESC;
END$$

CREATE DEFINER=`sertjerm_mykids`@`localhost` PROCEDURE `ResetTestData` ()   BEGIN
    -- ลบข้อมูลกิจกรรมทั้งหมด
    DELETE FROM DailyActivity;
    
    -- รีเซ็ต AUTO_INCREMENT
    ALTER TABLE DailyActivity AUTO_INCREMENT = 1;
    
    SELECT 'ข้อมูลทดสอบถูกรีเซ็ตแล้ว!' as Status;
END$$

--
-- Functions
--
CREATE DEFINER=`sertjerm_mykids`@`localhost` FUNCTION `GetNextBehaviorId` () RETURNS VARCHAR(4) CHARSET utf8mb3 COLLATE utf8mb3_unicode_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Behaviors 
    WHERE Id LIKE 'B%';
    
    RETURN CONCAT('B', LPAD(next_num, 3, '0'));
END$$

CREATE DEFINER=`sertjerm_mykids`@`localhost` FUNCTION `GetNextChildId` () RETURNS VARCHAR(4) CHARSET utf8mb3 COLLATE utf8mb3_unicode_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Children 
    WHERE Id LIKE 'C%';
    
    RETURN CONCAT('C', LPAD(next_num, 3, '0'));
END$$

CREATE DEFINER=`sertjerm_mykids`@`localhost` FUNCTION `GetNextRewardId` () RETURNS VARCHAR(4) CHARSET utf8mb3 COLLATE utf8mb3_unicode_ci DETERMINISTIC READS SQL DATA BEGIN
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
  `Name` varchar(200) NOT NULL COMMENT 'ชื่อพฤติกรรม',
  `Points` int(11) NOT NULL COMMENT 'คะแนน (บวก=ดี, ลบ=ไม่ดี)',
  `Color` varchar(20) NOT NULL COMMENT 'สีประจำพฤติกรรม',
  `Category` varchar(50) DEFAULT NULL COMMENT 'หมวดหมู่',
  `Type` enum('Good','Bad') NOT NULL COMMENT 'ประเภทพฤติกรรม',
  `IsRepeatable` tinyint(1) DEFAULT 0 COMMENT 'ทำซ้ำได้หรือไม่',
  `IsActive` tinyint(1) DEFAULT 1 COMMENT 'สถานะใช้งาน',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่สร้าง'
) ;

--
-- Dumping data for table `Behaviors`
--

INSERT INTO `Behaviors` (`Id`, `Name`, `Points`, `Color`, `Category`, `Type`, `IsRepeatable`, `IsActive`, `CreatedAt`) VALUES
('B001', 'แปรงฟัน', 3, '#4ADE80', 'สุขภาพ', 'Good', 0, 1, '2025-09-07 13:16:31'),
('B002', 'เก็บของเล่น', 2, '#60A5FA', 'ความรับผิดชอบ', 'Good', 0, 1, '2025-09-07 13:16:31'),
('B003', 'อ่านหนังสือ', 5, '#A78BFA', 'การเรียนรู้', 'Good', 0, 1, '2025-09-07 13:16:31'),
('B004', 'ช่วยงานบ้าน', 4, '#FBBF24', 'ความรับผิดชอบ', 'Good', 0, 1, '2025-09-07 13:16:31'),
('B005', 'ไหว้สวย', 8, '#FB7185', 'มารยาท', 'Good', 0, 1, '2025-09-07 13:16:31'),
('B006', 'พูดคำหยาบ', -3, '#EF4444', 'มารยาท', 'Bad', 1, 1, '2025-09-07 13:16:31'),
('B007', 'โกหก', -5, '#DC2626', 'จริยธรรม', 'Bad', 1, 1, '2025-09-07 13:16:31'),
('B008', 'ขี้เกียจ', -2, '#F87171', 'พฤติกรรม', 'Bad', 1, 1, '2025-09-07 13:16:31'),
('B009', 'เล่นมือถือนาน', -4, '#FCA5A5', 'สุขภาพ', 'Bad', 1, 1, '2025-09-07 13:16:31'),
('B010', 'ล้างจาน', 3, '#34D399', 'ความรับผิดชอบ', 'Good', 0, 1, '2025-09-08 14:35:20'),
('B011', 'ออกกำลังกาย', 6, '#F472B6', 'สุขภาพ', 'Good', 0, 1, '2025-09-08 14:35:20'),
('B012', 'ช่วยแม่ทำอาหาร', 5, '#FBBF24', 'ความรับผิดชอบ', 'Good', 0, 1, '2025-09-08 14:35:20'),
('B013', 'นอนตรงเวลา', 4, '#A78BFA', 'สุขภาพ', 'Good', 0, 1, '2025-09-08 14:35:20'),
('B014', 'ทักทายสวัสดี', 2, '#FB7185', 'มารยาท', 'Good', 0, 1, '2025-09-08 14:35:20'),
('B015', 'หยุดเรียน', -6, '#B91C1C', 'การเรียนรู้', 'Bad', 1, 1, '2025-09-08 14:35:20'),
('B016', 'ไม่ล้างมือ', -2, '#F87171', 'สุขภาพ', 'Bad', 1, 1, '2025-09-08 14:35:20'),
('B017', 'ทิ้งขยะไม่เป็นที่', -3, '#EF4444', 'สิ่งแวดล้อม', 'Bad', 1, 1, '2025-09-08 14:35:20'),
('B018', 'มาสายเรียน', -4, '#DC2626', 'ความรับผิดชอบ', 'Bad', 1, 1, '2025-09-08 14:35:20');

--
-- Triggers `Behaviors`
--
DELIMITER $$
CREATE TRIGGER `tr_behaviors_before_insert` BEFORE INSERT ON `Behaviors` FOR EACH ROW BEGIN
    -- สร้าง ID อัตโนมัติ
    IF NEW.Id IS NULL OR NEW.Id = '' THEN
        SET NEW.Id = GetNextBehaviorId();
    END IF;
    
    -- กำหนด IsRepeatable ตาม Type
    IF NEW.IsRepeatable IS NULL THEN
        IF NEW.Type = 'Good' THEN
            SET NEW.IsRepeatable = FALSE; -- Good = ทำครั้งเดียว
        ELSEIF NEW.Type = 'Bad' THEN
            SET NEW.IsRepeatable = TRUE;  -- Bad = ทำซ้ำได้
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
  `AutoId` int(11) NOT NULL COMMENT 'Auto increment ID',
  `Name` varchar(100) NOT NULL COMMENT 'ชื่อเด็ก',
  `Age` int(11) DEFAULT NULL COMMENT 'อายุ',
  `AvatarPath` varchar(255) DEFAULT NULL COMMENT 'รูปประจำตัว',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่สร้าง',
  `IsActive` tinyint(1) DEFAULT 1 COMMENT 'สถานะใช้งาน'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลเด็ก';

--
-- Dumping data for table `Children`
--

INSERT INTO `Children` (`Id`, `AutoId`, `Name`, `Age`, `AvatarPath`, `CreatedAt`, `IsActive`) VALUES
('C001', 1, 'น้องพีฟ่า', 11, NULL, '2025-09-07 13:16:30', 1),
('C002', 2, 'น้องพีฟอง', 10, NULL, '2025-09-07 13:16:30', 1),
('C003', 3, 'น้องมาริโอ้', 8, NULL, '2025-09-07 13:16:30', 1),
('C004', 4, 'ปปป', 7, '????', '2025-09-12 17:32:09', 1),
('C005', 5, 'น้องออย', 46, '????', '2025-09-13 13:16:06', 1);

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
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่บันทึก',
  `UpdatedAt` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'วันที่แก้ไขล่าสุด'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางกิจกรรมรายวัน - รวมพฤติกรรมและรางวัล';

--
-- Dumping data for table `DailyActivity`
--

INSERT INTO `DailyActivity` (`Id`, `ItemId`, `ChildId`, `ActivityDate`, `ActivityType`, `Count`, `EarnedPoints`, `Note`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'B001', 'C001', '2025-09-07', 'Good', 1, 3, 'แปรงฟันตอนเช้า', '2025-09-07 13:23:00', NULL),
(2, 'B002', 'C001', '2025-09-07', 'Good', 1, 2, 'เก็บของเล่นหลังเล่น', '2025-09-07 13:23:00', NULL),
(3, 'B003', 'C001', '2025-09-07', 'Good', 1, 5, 'อ่านหนังสือก่อนนอน', '2025-09-07 13:23:00', NULL),
(4, 'B001', 'C001', '2025-09-08', 'Good', 1, 3, 'แปรงฟันวันถัดไป', '2025-09-07 13:23:00', NULL),
(5, 'B006', 'C001', '2025-09-07', 'Bad', 2, -6, 'พูดคำหยาบกับน้อง | พูดคำหยาบอีกครั้ง', '2025-09-07 13:23:00', '2025-09-07 13:23:00'),
(7, 'B007', 'C001', '2025-09-07', 'Bad', 2, -10, 'โกหกเรื่องการบ้าน 2 ครั้ง', '2025-09-07 13:23:00', NULL),
(8, 'B008', 'C001', '2025-09-07', 'Bad', 1, -2, 'ไม่ยอมทำการบ้าน', '2025-09-07 13:23:00', NULL),
(9, 'B004', 'C001', '2025-09-07', 'Good', 1, 4, 'ช่วยงานบ้าน', '2025-09-07 13:23:00', NULL),
(10, 'B005', 'C001', '2025-09-07', 'Good', 1, 8, 'ไหว้สวยมาก', '2025-09-07 13:23:00', NULL),
(11, 'B002', 'C001', '2025-09-08', 'Good', 1, 2, 'เก็บของเล่นวันใหม่', '2025-09-07 13:23:00', NULL),
(12, 'B003', 'C001', '2025-09-08', 'Good', 1, 5, 'อ่านหนังสือวันใหม่', '2025-09-07 13:23:00', NULL),
(13, 'R001', 'C001', '2025-09-08', 'Reward', 1, -10, 'แลกไอศกรีมเย็น ๆ', '2025-09-07 13:23:00', NULL),
(14, 'B006', 'C001', '2025-09-08', 'Bad', 2, -6, 'พูดคำหยาบวันใหม่ + พูดคำหยาบอีกครั้ง', '2025-09-07 13:23:00', '2025-09-07 13:23:00'),
(16, 'B001', 'C002', '2025-09-08', 'Good', 1, 3, 'แปรงฟันเช้า', '2025-09-08 14:40:19', NULL),
(17, 'B003', 'C002', '2025-09-08', 'Good', 1, 5, 'อ่านหนังสือการ์ตูน', '2025-09-08 14:40:19', NULL),
(18, 'B004', 'C002', '2025-09-08', 'Good', 1, 4, 'ช่วยเก็บบ้าน', '2025-09-08 14:40:19', NULL),
(19, 'B001', 'C003', '2025-09-08', 'Good', 1, 3, 'แปรงฟันเช้า', '2025-09-08 14:40:19', NULL),
(20, 'B002', 'C003', '2025-09-08', 'Good', 1, 2, 'เก็บของเล่น', '2025-09-08 14:40:19', NULL),
(21, 'B008', 'C003', '2025-09-08', 'Bad', 1, -2, 'ไม่ทำการบ้าน', '2025-09-08 14:40:19', NULL),
(22, 'B005', 'C002', '2025-09-07', 'Good', 1, 8, 'ไหว้พ่อแม่', '2025-09-08 14:40:19', NULL),
(23, 'B004', 'C003', '2025-09-07', 'Good', 1, 4, 'ช่วยงานบ้าน', '2025-09-08 14:40:19', NULL),
(24, 'B006', 'C002', '2025-09-07', 'Bad', 1, -3, 'พูดคำหยาบ', '2025-09-08 14:40:19', NULL),
(25, 'B003', 'C002', '2025-09-06', 'Good', 1, 5, 'อ่านหนังสือ', '2025-09-08 14:40:19', NULL),
(26, 'B001', 'C003', '2025-09-06', 'Good', 1, 3, 'แปรงฟัน', '2025-09-08 14:40:19', NULL),
(27, 'R002', 'C002', '2025-09-06', 'Reward', 1, -15, 'ดู YouTube', '2025-09-08 14:40:19', NULL),
(36, 'B001', 'C002', '2025-09-09', 'Good', 1, 3, 'แปรงฟันเช้า', '2025-09-09 09:02:40', NULL),
(37, 'B003', 'C002', '2025-09-09', 'Good', 1, 5, 'อ่านหนังสือการ์ตูน', '2025-09-09 09:02:40', NULL),
(38, 'B001', 'C003', '2025-09-09', 'Good', 1, 3, 'แปรงฟันเช้า', '2025-09-09 09:02:40', NULL),
(39, 'B002', 'C003', '2025-09-09', 'Good', 1, 2, 'เก็บของเล่น', '2025-09-09 09:02:40', NULL),
(44, 'B001', 'C002', '2025-09-11', 'Good', 1, 3, 'แปรงฟันเช้า', '2025-09-11 09:32:28', NULL),
(45, 'B003', 'C002', '2025-09-11', 'Good', 1, 5, 'อ่านหนังสือการ์ตูน', '2025-09-11 09:32:28', NULL),
(46, 'B001', 'C003', '2025-09-11', 'Good', 1, 3, 'แปรงฟันเช้า', '2025-09-11 09:32:28', NULL),
(47, 'B002', 'C003', '2025-09-11', 'Good', 1, 2, 'เก็บของเล่น', '2025-09-11 09:32:28', NULL),
(60, 'B001', 'C002', '2025-09-12', 'Good', 1, 3, 'แปรงฟันเช้า', '2025-09-12 15:57:53', NULL),
(61, 'B003', 'C002', '2025-09-12', 'Good', 1, 5, 'อ่านหนังสือการ์ตูน', '2025-09-12 15:57:53', NULL),
(62, 'B001', 'C003', '2025-09-12', 'Good', 1, 3, 'แปรงฟันเช้า', '2025-09-12 15:57:53', NULL),
(63, 'B002', 'C003', '2025-09-12', 'Good', 1, 2, 'เก็บของเล่น', '2025-09-12 15:57:53', NULL),
(64, 'B005', 'C001', '2025-09-13', '', 1, 0, 'บันทึกจาก Child Dashboard', '2025-09-13 13:29:51', NULL),
(65, 'B004', 'C001', '2025-09-13', '', 2, 0, 'บันทึกจาก Child Dashboard', '2025-09-13 13:30:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Rewards`
--

CREATE TABLE `Rewards` (
  `Id` varchar(4) NOT NULL COMMENT 'รหัสรางวัล R001, R002, ...',
  `Name` varchar(200) NOT NULL COMMENT 'ชื่อรางวัล',
  `Cost` int(11) NOT NULL COMMENT 'ราคาแลก (คะแนน)',
  `Color` varchar(20) NOT NULL COMMENT 'สีประจำรางวัล',
  `Category` varchar(50) DEFAULT NULL COMMENT 'หมวดหมู่รางวัล',
  `IsActive` tinyint(1) DEFAULT 1 COMMENT 'สถานะใช้งาน',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่สร้าง'
) ;

--
-- Dumping data for table `Rewards`
--

INSERT INTO `Rewards` (`Id`, `Name`, `Cost`, `Color`, `Category`, `IsActive`, `CreatedAt`) VALUES
('R001', 'ไอศกรีม', 10, '#FFE4E1', 'ขนม', 1, '2025-09-07 13:16:31'),
('R002', 'ดู YouTube 30 นาที', 15, '#E6E6FA', 'บันเทิง', 1, '2025-09-07 13:16:31'),
('R003', 'ซื้อสติ๊กเกอร์', 20, '#F0F8FF', 'ของเล่น', 1, '2025-09-07 13:16:31'),
('R004', 'ขนมเค้ก', 25, '#FFF8DC', 'ขนม', 1, '2025-09-07 13:16:31'),
('R005', 'ไปสวนสนุก', 50, '#FFEFD5', 'กิจกรรม', 1, '2025-09-07 13:16:31'),
('R006', 'เล่นเกม 1 ชั่วโมง', 30, '#E0E6FF', 'บันเทิง', 1, '2025-09-08 14:35:20'),
('R007', 'ซื้อของเล่นใหม่', 80, '#FFE4B5', 'ของเล่น', 1, '2025-09-08 14:35:20'),
('R008', 'ไปหาเพื่อน', 35, '#E6FFE6', 'กิจกรรม', 1, '2025-09-08 14:35:20'),
('R009', 'ไปดูหนัง', 60, '#FFEBEE', 'บันเทิง', 1, '2025-09-08 14:35:20'),
('R010', 'ไม่ต้องล้างจาน 1 วัน', 40, '#F3E5F5', 'สิทธิพิเศษ', 1, '2025-09-08 14:35:20'),
('R011', 'เลือกเมนูอาหารเย็น', 25, '#E8F5E8', 'สิทธิพิเศษ', 1, '2025-09-08 14:35:20'),
('R012', 'นอนดึก 1 ชั่วโมง', 45, '#FFF0F5', 'สิทธิพิเศษ', 1, '2025-09-08 14:35:20'),
('R013', 'ไปซื้อขนม', 20, '#F0F8FF', 'ขนม', 1, '2025-09-08 14:35:20'),
('R014', 'เล่นเกม 1 ชั่วโมง', 30, '#E0E6FF', 'บันเทิง', 1, '2025-09-08 14:40:19'),
('R015', 'ซื้อของเล่นใหม่', 80, '#FFE4B5', 'ของเล่น', 1, '2025-09-08 14:40:19'),
('R016', 'ไปหาเพื่อน', 35, '#E6FFE6', 'กิจกรรม', 1, '2025-09-08 14:40:19'),
('R017', 'ไปดูหนัง', 60, '#FFEBEE', 'บันเทิง', 1, '2025-09-08 14:40:19'),
('R018', 'ไม่ต้องล้างจาน 1 วัน', 40, '#F3E5F5', 'สิทธิพิเศษ', 1, '2025-09-08 14:40:19'),
('R019', 'เลือกเมนูอาหารเย็น', 25, '#E8F5E8', 'สิทธิพิเศษ', 1, '2025-09-08 14:40:19'),
('R020', 'นอนดึก 1 ชั่วโมง', 45, '#FFF0F5', 'สิทธิพิเศษ', 1, '2025-09-08 14:40:19'),
('R021', 'ไปซื้อขนม', 20, '#F0F8FF', 'ขนม', 1, '2025-09-08 14:40:19'),
('R022', 'เล่นเกม 1 ชั่วโมง', 30, '#E0E6FF', 'บันเทิง', 1, '2025-09-08 14:46:57'),
('R023', 'ซื้อของเล่นใหม่', 80, '#FFE4B5', 'ของเล่น', 1, '2025-09-08 14:46:57'),
('R024', 'ไปหาเพื่อน', 35, '#E6FFE6', 'กิจกรรม', 1, '2025-09-08 14:46:57'),
('R025', 'ไปดูหนัง', 60, '#FFEBEE', 'บันเทิง', 1, '2025-09-08 14:46:57'),
('R026', 'ไม่ต้องล้างจาน 1 วัน', 40, '#F3E5F5', 'สิทธิพิเศษ', 1, '2025-09-08 14:46:57'),
('R027', 'เล่นเกม 1 ชั่วโมง', 30, '#E0E6FF', 'บันเทิง', 1, '2025-09-08 16:56:47'),
('R028', 'ซื้อของเล่นใหม่', 80, '#FFE4B5', 'ของเล่น', 1, '2025-09-08 16:56:47'),
('R029', 'ไปหาเพื่อน', 35, '#E6FFE6', 'กิจกรรม', 1, '2025-09-08 16:56:47'),
('R030', 'ไปดูหนัง', 60, '#FFEBEE', 'บันเทิง', 1, '2025-09-08 16:56:47'),
('R031', 'ไม่ต้องล้างจาน 1 วัน', 40, '#F3E5F5', 'สิทธิพิเศษ', 1, '2025-09-08 16:56:47');

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
,`Name` varchar(200)
,`Points` int(11)
,`Color` varchar(20)
,`Category` varchar(50)
,`ChildId` varchar(4)
,`ActivityDate` date
,`Type` enum('Good','Bad')
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
,`Name` varchar(100)
,`Age` int(11)
,`AvatarPath` varchar(255)
,`TotalPoints` decimal(32,0)
,`EarnedPoints` decimal(32,0)
,`DeductedPoints` decimal(32,0)
,`GoodBehaviorCount` decimal(32,0)
,`BadBehaviorCount` decimal(32,0)
,`RewardCount` decimal(32,0)
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
  ADD KEY `idx_behaviors_type` (`Type`),
  ADD KEY `idx_behaviors_active` (`IsActive`),
  ADD KEY `idx_behaviors_category` (`Category`),
  ADD KEY `idx_behaviors_type_active` (`Type`,`IsActive`);

--
-- Indexes for table `Children`
--
ALTER TABLE `Children`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `AutoId` (`AutoId`),
  ADD KEY `idx_children_auto_id` (`AutoId`),
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
-- Indexes for table `Rewards`
--
ALTER TABLE `Rewards`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_rewards_cost` (`Cost`),
  ADD KEY `idx_rewards_active` (`IsActive`),
  ADD KEY `idx_rewards_category` (`Category`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Children`
--
ALTER TABLE `Children`
  MODIFY `AutoId` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Auto increment ID', AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `DailyActivity`
--
ALTER TABLE `DailyActivity`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'รหัสกิจกรรม', AUTO_INCREMENT=68;

-- --------------------------------------------------------

--
-- Structure for view `vw_BehaviorDailySummary`
--
DROP TABLE IF EXISTS `vw_BehaviorDailySummary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sertjerm_mykids`@`localhost` SQL SECURITY DEFINER VIEW `vw_BehaviorDailySummary`  AS SELECT `b`.`Id` AS `Id`, `b`.`Name` AS `Name`, `b`.`Points` AS `Points`, `b`.`Color` AS `Color`, `b`.`Category` AS `Category`, `d`.`ChildId` AS `ChildId`, `d`.`ActivityDate` AS `ActivityDate`, `b`.`Type` AS `Type`, count(distinct `d`.`ChildId`) AS `CompletedChildrenCount`, sum(ifnull(`d`.`Count`,0)) AS `TotalCount`, sum(ifnull(`d`.`Count`,0)) * `b`.`Points` AS `TotalPoints`, CASE WHEN count(`d`.`ChildId`) > 0 THEN 1 ELSE 0 END AS `isCompleted` FROM (`Behaviors` `b` left join `DailyActivity` `d` on(`b`.`Id` = `d`.`ItemId` and `d`.`ActivityType` = `b`.`Type`)) WHERE `b`.`IsActive` = 1 GROUP BY `b`.`Id`, `b`.`Name`, `b`.`Points`, `b`.`Color`, `b`.`Category`, `b`.`Type`, `d`.`ChildId`, `d`.`ActivityDate` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_ChildrenScores`
--
DROP TABLE IF EXISTS `vw_ChildrenScores`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sertjerm_mykids`@`localhost` SQL SECURITY DEFINER VIEW `vw_ChildrenScores`  AS SELECT `c`.`Id` AS `Id`, `c`.`Name` AS `Name`, `c`.`Age` AS `Age`, `c`.`AvatarPath` AS `AvatarPath`, coalesce(`scores`.`TotalPoints`,0) AS `TotalPoints`, coalesce(`scores`.`EarnedPoints`,0) AS `EarnedPoints`, coalesce(`scores`.`DeductedPoints`,0) AS `DeductedPoints`, coalesce(`counts`.`GoodBehaviorCount`,0) AS `GoodBehaviorCount`, coalesce(`counts`.`BadBehaviorCount`,0) AS `BadBehaviorCount`, coalesce(`counts`.`RewardCount`,0) AS `RewardCount`, `c`.`CreatedAt` AS `CreatedAt`, `c`.`IsActive` AS `IsActive` FROM ((`Children` `c` left join (select `DailyActivity`.`ChildId` AS `ChildId`,sum(case when `DailyActivity`.`EarnedPoints` > 0 then `DailyActivity`.`EarnedPoints` else 0 end) AS `EarnedPoints`,sum(case when `DailyActivity`.`EarnedPoints` < 0 then abs(`DailyActivity`.`EarnedPoints`) else 0 end) AS `DeductedPoints`,sum(`DailyActivity`.`EarnedPoints`) AS `TotalPoints` from `DailyActivity` group by `DailyActivity`.`ChildId`) `scores` on(`c`.`Id` = `scores`.`ChildId`)) left join (select `DailyActivity`.`ChildId` AS `ChildId`,sum(case when `DailyActivity`.`ActivityType` = 'Good' then `DailyActivity`.`Count` else 0 end) AS `GoodBehaviorCount`,sum(case when `DailyActivity`.`ActivityType` = 'Bad' then `DailyActivity`.`Count` else 0 end) AS `BadBehaviorCount`,sum(case when `DailyActivity`.`ActivityType` = 'Reward' then `DailyActivity`.`Count` else 0 end) AS `RewardCount` from `DailyActivity` group by `DailyActivity`.`ChildId`) `counts` on(`c`.`Id` = `counts`.`ChildId`)) WHERE `c`.`IsActive` = 1 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `DailyActivity`
--
ALTER TABLE `DailyActivity`
  ADD CONSTRAINT `DailyActivity_ibfk_1` FOREIGN KEY (`ChildId`) REFERENCES `Children` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
