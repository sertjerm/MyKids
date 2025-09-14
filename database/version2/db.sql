-- ===============================================
-- MyKids Database - Updated Schema
-- ระบบติดตามพฤติกรรมเด็ก
-- ===============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS `mykids_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mykids_system`;

-- ===============================================
-- FUNCTIONS - ฟังก์ชันสำหรับสร้าง ID อัตโนมัติ
-- ===============================================

DELIMITER $$

-- ฟังก์ชันสร้าง Family ID
CREATE FUNCTION GetNextFamilyId() RETURNS VARCHAR(4) 
CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci 
DETERMINISTIC READS SQL DATA 
BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Families 
    WHERE Id LIKE 'F%';
    
    RETURN CONCAT('F', LPAD(next_num, 3, '0'));
END$$

-- ฟังก์ชันสร้าง Child ID
CREATE FUNCTION GetNextChildId() RETURNS VARCHAR(4) 
CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci 
DETERMINISTIC READS SQL DATA 
BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Children 
    WHERE Id LIKE 'C%';
    
    RETURN CONCAT('C', LPAD(next_num, 3, '0'));
END$$

-- ฟังก์ชันสร้าง Behavior ID
CREATE FUNCTION GetNextBehaviorId() RETURNS VARCHAR(4) 
CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci 
DETERMINISTIC READS SQL DATA 
BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Behaviors 
    WHERE Id LIKE 'B%';
    
    RETURN CONCAT('B', LPAD(next_num, 3, '0'));
END$$

-- ฟังก์ชันสร้าง Reward ID
CREATE FUNCTION GetNextRewardId() RETURNS VARCHAR(4) 
CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci 
DETERMINISTIC READS SQL DATA 
BEGIN
    DECLARE next_num INT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(Id, 2) AS UNSIGNED)), 0) + 1 
    INTO next_num 
    FROM Rewards 
    WHERE Id LIKE 'R%';
    
    RETURN CONCAT('R', LPAD(next_num, 3, '0'));
END$$

DELIMITER ;

-- ===============================================
-- TABLE STRUCTURES - โครงสร้างตาราง
-- ===============================================

-- ตาราง Families - ข้อมูลครอบครัว
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

-- ตาราง Children - ข้อมูลเด็ก
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

-- ตาราง Behaviors - พฤติกรรม
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

-- ตาราง Rewards - รางวัล
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

-- ตาราง DailyActivity - กิจกรรมรายวัน
CREATE TABLE `DailyActivity` (
  `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'รหัสกิจกรรม',
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
  `UpdatedAt` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'วันที่แก้ไขล่าสุด',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `uk_daily_activity_child_item_date` (`ChildId`,`ItemId`,`ActivityDate`),
  KEY `idx_daily_activity_date` (`ActivityDate`),
  KEY `idx_daily_activity_child` (`ChildId`),
  KEY `idx_daily_activity_item` (`ItemId`),
  KEY `idx_daily_activity_type` (`ActivityType`),
  KEY `idx_daily_activity_child_date` (`ChildId`,`ActivityDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางกิจกรรมรายวัน - รวมพฤติกรรมและรางวัล';

-- ตาราง PointsHistory - ประวัติคะแนน
CREATE TABLE `PointsHistory` (
  `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'รหัสประวัติ',
  `ChildId` varchar(4) NOT NULL COMMENT 'รหัสเด็ก',
  `ActivityId` int(11) NOT NULL COMMENT 'รหัสกิจกรรมอ้างอิง',
  `PointsBefore` int(11) NOT NULL COMMENT 'คะแนนก่อนหน้า',
  `PointsChange` int(11) NOT NULL COMMENT 'คะแนนที่เปลี่ยน',
  `PointsAfter` int(11) NOT NULL COMMENT 'คะแนนหลังเปลี่ยน',
  `CreatedAt` datetime DEFAULT current_timestamp() COMMENT 'วันที่บันทึก',
  PRIMARY KEY (`Id`),
  KEY `idx_points_history_child` (`ChildId`),
  KEY `idx_points_history_activity` (`ActivityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางประวัติคะแนน';

-- ===============================================
-- INDEXES AND CONSTRAINTS - ดัชนีและข้อจำกัด
-- ===============================================

-- Families Table
ALTER TABLE `Families`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `uk_families_email` (`Email`),
  ADD KEY `idx_families_active` (`IsActive`);

-- Children Table
ALTER TABLE `Children`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_children_family` (`FamilyId`),
  ADD KEY `idx_children_active` (`IsActive`),
  ADD KEY `idx_children_name` (`Name`);

-- Behaviors Table
ALTER TABLE `Behaviors`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_behaviors_family` (`FamilyId`),
  ADD KEY `idx_behaviors_type` (`Type`),
  ADD KEY `idx_behaviors_active` (`IsActive`),
  ADD KEY `idx_behaviors_category` (`Category`);

-- Rewards Table
ALTER TABLE `Rewards`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `idx_rewards_family` (`FamilyId`),
  ADD KEY `idx_rewards_cost` (`Cost`),
  ADD KEY `idx_rewards_active` (`IsActive`),
  ADD KEY `idx_rewards_category` (`Category`);

-- Foreign Key Constraints
ALTER TABLE `Children`
  ADD CONSTRAINT `fk_children_family` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE;

ALTER TABLE `Behaviors`
  ADD CONSTRAINT `fk_behaviors_family` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE;

ALTER TABLE `Rewards`
  ADD CONSTRAINT `fk_rewards_family` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE;

ALTER TABLE `DailyActivity`
  ADD CONSTRAINT `fk_daily_activity_child` FOREIGN KEY (`ChildId`) REFERENCES `Children` (`Id`) ON DELETE CASCADE;

ALTER TABLE `PointsHistory`
  ADD CONSTRAINT `fk_points_history_child` FOREIGN KEY (`ChildId`) REFERENCES `Children` (`Id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_points_history_activity` FOREIGN KEY (`ActivityId`) REFERENCES `DailyActivity` (`Id`) ON DELETE CASCADE;

-- ===============================================
-- TRIGGERS - ทริกเกอร์
-- ===============================================

DELIMITER $$

-- Trigger สำหรับ Families
CREATE TRIGGER `tr_families_before_insert` BEFORE INSERT ON `Families` FOR EACH ROW 
BEGIN
    IF NEW.Id IS NULL OR NEW.Id = '' THEN
        SET NEW.Id = GetNextFamilyId();
    END IF;
END$$

-- Trigger สำหรับ Children
CREATE TRIGGER `tr_children_before_insert` BEFORE INSERT ON `Children` FOR EACH ROW 
BEGIN
    IF NEW.Id IS NULL OR NEW.Id = '' THEN
        SET NEW.Id = GetNextChildId();
    END IF;
END$$

-- Trigger สำหรับ Behaviors
CREATE TRIGGER `tr_behaviors_before_insert` BEFORE INSERT ON `Behaviors` FOR EACH ROW 
BEGIN
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
END$$

-- Trigger สำหรับ Rewards
CREATE TRIGGER `tr_rewards_before_insert` BEFORE INSERT ON `Rewards` FOR EACH ROW 
BEGIN
    IF NEW.Id IS NULL OR NEW.Id = '' THEN
        SET NEW.Id = GetNextRewardId();
    END IF;
END$$

-- Trigger สำหรับ Points History
CREATE TRIGGER `tr_daily_activity_after_insert` AFTER INSERT ON `DailyActivity` FOR EACH ROW 
BEGIN
    DECLARE current_points INT DEFAULT 0;
    
    -- คำนวณคะแนนปัจจุบัน
    SELECT COALESCE(SUM(EarnedPoints), 0) INTO current_points
    FROM DailyActivity 
    WHERE ChildId = NEW.ChildId AND Status = 'Approved';
    
    -- บันทึกประวัติคะแนน
    INSERT INTO PointsHistory (ChildId, ActivityId, PointsBefore, PointsChange, PointsAfter)
    VALUES (NEW.ChildId, NEW.Id, current_points - NEW.EarnedPoints, NEW.EarnedPoints, current_points);
END$$

DELIMITER ;

-- ===============================================
-- VIEWS - วิว
-- ===============================================

-- วิวคะแนนเด็ก
CREATE VIEW `vw_ChildrenScores` AS
SELECT 
    c.Id,
    c.FamilyId,
    c.Name,
    c.Age,
    c.Gender,
    c.AvatarPath,
    c.DateOfBirth,
    COALESCE(scores.TotalPoints, 0) as TotalPoints,
    COALESCE(scores.EarnedPoints, 0) as EarnedPoints,
    COALESCE(scores.DeductedPoints, 0) as DeductedPoints,
    COALESCE(counts.GoodBehaviorCount, 0) as GoodBehaviorCount,
    COALESCE(counts.BadBehaviorCount, 0) as BadBehaviorCount,
    COALESCE(counts.RewardCount, 0) as RewardCount,
    c.CreatedAt,
    c.IsActive
FROM Children c
LEFT JOIN (
    SELECT 
        ChildId,
        SUM(CASE WHEN EarnedPoints > 0 THEN EarnedPoints ELSE 0 END) as EarnedPoints,
        SUM(CASE WHEN EarnedPoints < 0 THEN ABS(EarnedPoints) ELSE 0 END) as DeductedPoints,
        SUM(EarnedPoints) as TotalPoints
    FROM DailyActivity 
    WHERE Status = 'Approved'
    GROUP BY ChildId
) scores ON c.Id = scores.ChildId
LEFT JOIN (
    SELECT 
        ChildId,
        SUM(CASE WHEN ActivityType = 'Good' THEN Count ELSE 0 END) as GoodBehaviorCount,
        SUM(CASE WHEN ActivityType = 'Bad' THEN Count ELSE 0 END) as BadBehaviorCount,
        SUM(CASE WHEN ActivityType = 'Reward' THEN Count ELSE 0 END) as RewardCount
    FROM DailyActivity 
    WHERE Status = 'Approved'
    GROUP BY ChildId
) counts ON c.Id = counts.ChildId
WHERE c.IsActive = 1;

-- วิวสรุปพฤติกรรมรายวัน
CREATE VIEW `vw_BehaviorDailySummary` AS
SELECT 
    b.Id,
    b.FamilyId,
    b.Name,
    b.Points,
    b.Color,
    b.Category,
    b.Type,
    d.ChildId,
    d.ActivityDate,
    COUNT(DISTINCT d.ChildId) as CompletedChildrenCount,
    SUM(COALESCE(d.Count, 0)) as TotalCount,
    SUM(COALESCE(d.Count, 0)) * b.Points as TotalPoints,
    CASE WHEN COUNT(d.ChildId) > 0 THEN 1 ELSE 0 END as isCompleted
FROM Behaviors b
LEFT JOIN DailyActivity d ON b.Id = d.ItemId AND d.ActivityType = b.Type AND d.Status = 'Approved'
WHERE b.IsActive = 1
GROUP BY b.Id, b.FamilyId, b.Name, b.Points, b.Color, b.Category, b.Type, d.ChildId, d.ActivityDate;

-- วิวสรุปครอบครัว
CREATE VIEW `vw_FamilySummary` AS
SELECT 
    f.Id,
    f.Name,
    f.Email,
    f.Phone,
    f.AvatarPath,
    COUNT(DISTINCT c.Id) as TotalChildren,
    COUNT(DISTINCT b.Id) as TotalBehaviors,
    COUNT(DISTINCT r.Id) as TotalRewards,
    COALESCE(SUM(cs.TotalPoints), 0) as FamilyTotalPoints,
    f.CreatedAt,
    f.IsActive
FROM Families f
LEFT JOIN Children c ON f.Id = c.FamilyId AND c.IsActive = 1
LEFT JOIN Behaviors b ON f.Id = b.FamilyId AND b.IsActive = 1
LEFT JOIN Rewards r ON f.Id = r.FamilyId AND r.IsActive = 1
LEFT JOIN vw_ChildrenScores cs ON c.Id = cs.Id
WHERE f.IsActive = 1
GROUP BY f.Id, f.Name, f.Email, f.Phone, f.AvatarPath, f.CreatedAt, f.IsActive;

-- ===============================================
-- STORED PROCEDURES - โปรซีเดอร์
-- ===============================================

DELIMITER $$

-- โปรซีเดอร์ดึงสถิติเด็ก
CREATE PROCEDURE `GetChildStatistics`(IN `child_id` VARCHAR(4))
BEGIN
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

-- โปรซีเดอร์ดึงกิจกรรมรายวัน
CREATE PROCEDURE `GetDailyActivities`(IN `target_date` DATE, IN `child_id` VARCHAR(4))
BEGIN
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

-- โปรซีเดอร์ล้างข้อมูลทดสอบ
CREATE PROCEDURE `ResetTestData`()
BEGIN
    DELETE FROM PointsHistory;
    DELETE FROM DailyActivity;
    ALTER TABLE DailyActivity AUTO_INCREMENT = 1;
    ALTER TABLE PointsHistory AUTO_INCREMENT = 1;
    
    SELECT 'ข้อมูลทดสอบถูกรีเซ็ตแล้ว!' as Status;
END$$

-- โปรซีเดอร์เพิ่มคะแนนเด็ก
CREATE PROCEDURE `AddChildPoints`(
    IN `child_id` VARCHAR(4),
    IN `item_id` VARCHAR(4),
    IN `activity_type` ENUM('Good','Bad','Reward'),
    IN `points` INT,
    IN `note` TEXT
)
BEGIN
    DECLARE activity_date DATE DEFAULT CURDATE();
    
    INSERT INTO DailyActivity (ItemId, ChildId, ActivityDate, ActivityType, EarnedPoints, Note, Status)
    VALUES (item_id, child_id, activity_date, activity_type, points, note, 'Approved');
    
    SELECT 'บันทึกสำเร็จ!' as Status, LAST_INSERT_ID() as ActivityId;
END$$

DELIMITER ;

-- ===============================================
-- SAMPLE DATA - ข้อมูลตัวอย่าง
-- ===============================================

-- ข้อมูลครอบครัว
INSERT INTO `Families` (`Id`, `Name`, `Password`, `Email`, `Phone`, `AvatarPath`) VALUES
('F001', 'ครอบครัวสมิท', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'smith@example.com', '081-234-5678', '👨‍👩‍👧‍👦'),
('F002', 'ครอบครัวจอห์นสัน', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'johnson@example.com', '081-876-5432', '👨‍👩‍👧‍👦');

-- ข้อมูลเด็ก
INSERT INTO `Children` (`Id`, `FamilyId`, `Name`, `Age`, `Gender`, `AvatarPath`, `DateOfBirth`) VALUES
('C001', 'F001', 'น้องพีฟ่า', 11, 'F', '👧', '2013-05-15'),
('C002', 'F001', 'น้องพีฟอง', 10, 'M', '👦', '2014-08-20'),
('C003', 'F002', 'น้องมาริโอ้', 8, 'M', '👶', '2016-12-03'),
('C004', 'F002', 'น้องอย', 7, 'F', '👧', '2017-09-10');

-- ข้อมูลพฤติกรรม - ครอบครัวสมิท
INSERT INTO `Behaviors` (`Id`, `FamilyId`, `Name`, `Points`, `Color`, `Category`, `Type`, `IsRepeatable`, `Description`) VALUES
('B001', 'F001', 'แปรงฟัน', 3, '#4ADE80', 'สุขภาพ', 'Good', 0, 'แปรงฟันเช้า-เย็น'),
('B002', 'F001', 'เก็บของเล่น', 2, '#60A5FA', 'ความรับผิดชอบ', 'Good', 0, 'เก็บของเล่นหลังเล่น'),
('B003', 'F001', 'อ่านหนังสือ', 5, '#A78BFA', 'การเรียนรู้', 'Good', 0, 'อ่านหนังสือก่อนนอน'),
('B004', 'F001', 'ช่วยงานบ้าน', 4, '#FBBF24', 'ความรับผิดชอบ', 'Good', 0, 'ช่วยงานบ้าน'),
('B005', 'F001', 'ไหว้สวย', 8, '#FB7185', 'มารยาท', 'Good', 0, 'ไหว้สวยมาก'),
('B006', 'F001', 'พูดคำหยาบ', -3, '#EF4444', 'มารยาท', 'Bad', 1, 'พูดคำหยาบคาย'),
('B007', 'F001', 'โกหก', -5, '#DC2626', 'จริยธรรม', 'Bad', 1, 'โกหกเรื่องต่างๆ'),
('B008', 'F001', 'ขี้เกียจ', -2, '#F87171', 'พฤติกรรม', 'Bad', 1, 'ไม่ยอมทำกิจกรรม');

-- ข้อมูลพฤติกรรม - ครอบครัวจอห์นสัน
INSERT INTO `Behaviors` (`Id`, `FamilyId`, `Name`, `Points`, `Color`, `Category`, `Type`, `IsRepeatable`, `Description`) VALUES
('B009', 'F002', 'แปรงฟัน', 3, '#4ADE80', 'สุขภาพ', 'Good', 0, 'แปรงฟันเช้า-เย็น'),
('B010', 'F002', 'เก็บของเล่น', 2, '#60A5FA', 'ความรับผิดชอบ', 'Good', 0, 'เก็บของเล่นหลังเล่น'),
('B011', 'F002', 'ออกกำลังกาย', 6, '#F472B6', 'สุขภาพ', 'Good', 0, 'ออกกำลังกาย'),
('B012', 'F002', 'ช่วยแม่ทำอาหาร', 5, '#FBBF24', 'ความรับผิดชอบ', 'Good', 0, 'ช่วยแม่ทำอาหาร'),
('B013', 'F002', 'นอนตรงเวลา', 4, '#A78BFA', 'สุขภาพ', 'Good', 0, 'นอนตรงเวลา'),
('B014', 'F002', 'ทักทายสวัสดี', 2, '#FB7185', 'มารยาท', 'Good', 0, 'ทักทายสวัสดี'),
('B015', 'F002', 'หยุดเรียน', -6, '#B91C1C', 'การเรียนรู้', 'Bad', 1, 'หยุดเรียนไม่มีเหตุผล'),
('B016', 'F002', 'ไม่ล้างมือ', -2, '#F87171', 'สุขภาพ', 'Bad', 1, 'ไม่ล้างมือก่อนอาหาร');

-- ข้อมูลรางวัล - ครอบครัวสมิท
INSERT INTO `Rewards` (`Id`, `FamilyId`, `Name`, `Cost`, `Color`, `Category`, `Description`) VALUES
('R001', 'F001', 'ไอศกรีม', 10, '#FFE4E1', 'ขนม', 'ไอศกรีมแท่งอร่อย'),
('R002', 'F001', 'ดู YouTube 30 นาที', 15, '#E6E6FA', 'บันเทิง', 'ดู YouTube นาน 30 นาที'),
('R003', 'F001', 'ซื้อสติ๊กเกอร์', 20, '#F0F8FF', 'ของเล่น', 'ซื้อสติ๊กเกอร์ชุดใหม่'),
('R004', 'F001', 'ขนมเค้ก', 25, '#FFF8DC', 'ขนม', 'ขนมเค้กชิ้นพิเศษ'),
('R005', 'F001', 'ไปสวนสนุก', 50, '#FFEFD5', 'กิจกรรม', 'ไปเที่ยวสวนสนุก');

-- ข้อมูลรางวัล - ครอบครัวจอห์นสัน  
INSERT INTO `Rewards` (`Id`, `FamilyId`, `Name`, `Cost`, `Color`, `Category`, `Description`) VALUES
('R006', 'F002', 'เล่นเกม 1 ชั่วโมง', 30, '#E0E6FF', 'บันเทิง', 'เล่นเกมคอมพิวเตอร์ 1 ชั่วโมง'),
('R007', 'F002', 'ซื้อของเล่นใหม่', 80, '#FFE4B5', 'ของเล่น', 'ซื้อของเล่นใหม่'),
('R008', 'F002', 'ไปหาเพื่อน', 35, '#E6FFE6', 'กิจกรรม', 'ไปเที่ยวกับเพื่อน'),
('R009', 'F002', 'ไปดูหนัง', 60, '#FFEBEE', 'บันเทิง', 'ไปดูหนังที่โรงภาพยนตร์'),
('R010', 'F002', 'ไม่ต้องล้างจาน 1 วัน', 40, '#F3E5F5', 'สิทธิพิเศษ', 'ได้สิทธิไม่ต้องล้างจาน');

-- ข้อมูลกิจกรรมตัวอย่าง
INSERT INTO `DailyActivity` (`ItemId`, `ChildId`, `ActivityDate`, `ActivityType`, `Count`, `EarnedPoints`, `Note`, `Status`) VALUES
('B001', 'C001', '2024-12-15', 'Good', 1, 3, 'แปรงฟันเช้าแล้ว', 'Approved'),
('B002', 'C001', '2024-12-15', 'Good', 1, 2, 'เก็บของเล่นหลังเล่น', 'Approved'),
('B003', 'C001', '2024-12-15', 'Good', 1, 5, 'อ่านหนังสือก่อนนอน', 'Approved'),
('B001', 'C002', '2024-12-15', 'Good', 1, 3, 'แปรงฟันเช้า', 'Approved'),
('B004', 'C002', '2024-12-15', 'Good', 1, 4, 'ช่วยเก็บจาน', 'Approved'),
('B006', 'C001', '2024-12-15', 'Bad', 1, -3, 'พูดคำหยาบกับน้อง', 'Approved'),
('R001', 'C001', '2024-12-15', 'Reward', 1, -10, 'แลกไอศกรีม', 'Approved');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;