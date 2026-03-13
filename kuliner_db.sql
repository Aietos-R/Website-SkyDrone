-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 05 Mar 2026 pada 15.51
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kuliner_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `ip` varchar(100) NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `last_attempt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `username`, `ip`, `attempts`, `locked_until`, `last_attempt`) VALUES
(2, 'Reika', '::1', 1, NULL, '2025-12-28 18:28:59'),
(3, 'raditya', '::1', 1, NULL, '2025-12-28 18:29:02');

-- --------------------------------------------------------

--
-- Struktur dari tabel `menus`
--

CREATE TABLE `menus` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('ayam','nasi','minuman','side_dish','paket') NOT NULL,
  `price` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `spicy_level` int(11) DEFAULT 0 CHECK (`spicy_level` between 0 and 3),
  `variant` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT 'default.jpg',
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `menus`
--

INSERT INTO `menus` (`id`, `name`, `category`, `price`, `description`, `spicy_level`, `variant`, `image`, `is_available`, `created_at`) VALUES
(1, 'Ayam Geprek Original', 'ayam', 15000, 'Ayam crispy digeprek dengan sambal bawang', 2, 'Tulang', 'menu-1765291787042-487885270.jpg', 1, '2025-12-01 10:03:06'),
(2, 'Ayam Geprek Mozarella', 'ayam', 22000, 'Ayam geprek dengan keju mozarella leleh', 1, 'Fillet', 'menu-1765291835491-91425004.jpg', 1, '2025-12-01 10:03:06'),
(3, 'Nasi Sambal Matah', 'nasi', 12000, 'Nasi putih dengan sambal matah khas Bali', 3, 'Level 3', 'menu-1765291945293-210292502.jpg', 1, '2025-12-01 10:03:06'),
(4, 'Es Teh Manis', 'minuman', 5000, 'Es teh dengan gula pasir', 0, 'Regular', 'menu-1765292010590-487087294.jpg', 1, '2025-12-01 10:03:06'),
(5, 'Kentang Goreng', 'side_dish', 10000, 'Kentang goreng renyah', 0, 'Medium', 'menu-1765292065131-945127812.jpg', 1, '2025-12-01 10:03:06'),
(6, 'Paket Ayam Geprek + Nasi + Es Teh', 'paket', 30000, 'Paket lengkap ayam geprek, nasi, dan es teh', 2, 'Paket Hemat', 'menu-1765292218819-744804049.jpeg', 1, '2025-12-01 10:03:06'),
(7, 'Dalgona Coffee', 'minuman', 18000, 'Kopi dalgona kekinian', 0, 'Cold', 'menu-1765292242436-465825107.jpg', 1, '2025-12-01 10:03:06'),
(8, 'Dimsum Ayam', 'side_dish', 12000, 'Dimsum ayam dengan saus khusus', 0, '6 pcs', 'menu-1765292272582-667812990.jpg', 1, '2025-12-01 10:03:06');

-- --------------------------------------------------------

--
-- Struktur dari tabel `online_orders`
--

CREATE TABLE `online_orders` (
  `id` int(11) NOT NULL,
  `invoice` varchar(32) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `status` enum('pending','approved','in_kitchen','ready','driver_picked','on_delivery','delivered','completed','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `online_orders`
--

INSERT INTO `online_orders` (`id`, `invoice`, `user_id`, `total`, `status`, `created_at`) VALUES
(1, 'CUST-20251203-648', 3, 15000, 'completed', '2025-12-03 10:09:49'),
(2, 'CUST-20251203-941', 3, 22000, 'completed', '2025-12-03 11:08:43'),
(3, 'CUST-20251203-747', 3, 12000, 'completed', '2025-12-03 11:09:09'),
(4, 'CUST-20251203-161', 3, 12000, 'completed', '2025-12-03 11:09:36'),
(5, 'CUST-20251203-527', 3, 5000, 'completed', '2025-12-03 11:10:08'),
(6, 'CUST-20251203-992', 3, 10000, 'completed', '2025-12-03 11:10:26'),
(7, 'CUST-20251203-939', 3, 30000, 'completed', '2025-12-03 16:08:31'),
(8, 'CUST-20251206-445', 3, 15000, 'completed', '2025-12-06 17:26:22'),
(9, 'CUST-20251208-584', 3, 15000, 'in_kitchen', '2025-12-08 13:29:14'),
(10, 'CUST-20251209-257', 3, 15000, 'rejected', '2025-12-09 21:33:33'),
(11, 'CUST-20251209-283', 3, 37000, 'approved', '2025-12-09 22:24:18'),
(12, 'CUST-20251209-894', 3, 37000, '', '2025-12-09 22:24:44'),
(13, 'CUST-20251209-793', 3, 37000, '', '2025-12-09 22:27:00'),
(14, 'CUST-20251209-634', 3, 15000, '', '2025-12-09 22:56:04'),
(15, 'CUST-20251209-150', 3, 15000, '', '2025-12-09 23:27:52'),
(16, 'CUST-20251210-118', 3, 15000, '', '2025-12-10 07:23:36'),
(17, 'CUST-20251210-244', 12, 105000, 'approved', '2025-12-10 09:33:46');

-- --------------------------------------------------------

--
-- Struktur dari tabel `online_order_items`
--

CREATE TABLE `online_order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `name` varchar(128) NOT NULL,
  `price` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `spicy_level` int(11) DEFAULT 0,
  `sambal_type` varchar(32) DEFAULT NULL,
  `variant` varchar(32) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `online_order_items`
--

INSERT INTO `online_order_items` (`id`, `order_id`, `menu_id`, `name`, `price`, `quantity`, `spicy_level`, `sambal_type`, `variant`) VALUES
(1, 1, 1, 'Ayam Geprek Original', 15000, 1, 5, NULL, 'tanpa_tulang'),
(2, 2, 2, 'Ayam Geprek Mozarella', 22000, 1, 0, NULL, NULL),
(3, 3, 3, 'Nasi Sambal Matah', 12000, 1, 0, NULL, NULL),
(4, 4, 3, 'Nasi Sambal Matah', 12000, 1, 0, NULL, NULL),
(5, 5, 4, 'Es Teh Manis', 5000, 1, 0, NULL, NULL),
(6, 6, 5, 'Kentang Goreng', 10000, 1, 0, NULL, NULL),
(7, 7, 6, 'Paket Ayam Geprek + Nasi + Es Teh', 30000, 1, 0, NULL, NULL),
(8, 8, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(9, 9, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(10, 10, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(11, 11, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(12, 11, 2, 'Ayam Geprek Mozarella', 22000, 1, 0, NULL, 'tulang'),
(13, 12, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(14, 12, 2, 'Ayam Geprek Mozarella', 22000, 1, 0, NULL, 'tulang'),
(15, 13, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(16, 13, 2, 'Ayam Geprek Mozarella', 22000, 1, 0, NULL, 'tulang'),
(17, 14, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(18, 15, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(19, 16, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(20, 17, 1, 'Ayam Geprek Original', 15000, 1, 0, NULL, 'tulang'),
(21, 17, 1, 'Ayam Geprek Original', 15000, 6, 5, NULL, 'tanpa_tulang');

-- --------------------------------------------------------

--
-- Struktur dari tabel `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `party_size` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reason` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `reservations`
--

INSERT INTO `reservations` (`id`, `user_id`, `name`, `phone`, `date`, `time`, `party_size`, `status`, `created_at`, `reason`) VALUES
(1, NULL, 'Test Admin View', '081200000000', '2025-12-03', '18:30:00', 3, 'pending', '2025-12-03 09:45:01', NULL),
(2, 3, 'User Reserve', '0812345678', '2025-12-03', '18:01:00', 2, 'pending', '2025-12-03 10:01:03', NULL),
(3, 6, 'User Reserve', '0812345678', '2025-12-06', '16:11:00', 2, 'pending', '2025-12-06 09:11:45', NULL),
(4, 6, 'User Reserve', '0812345678', '2025-12-06', '16:11:00', 2, 'pending', '2025-12-06 09:11:59', NULL),
(5, 6, 'SSE Trigger', '0811111111', '2025-12-06', '16:12:00', 1, 'pending', '2025-12-06 09:12:20', NULL),
(6, 3, 'Test User', '081234567890', '2025-12-06', '18:30:00', 3, 'pending', '2025-12-06 16:32:25', NULL),
(7, 3, 'rendy', '083113484208', '2026-01-01', '13:00:00', 2, 'approved', '2025-12-06 16:40:18', 'boleh keterlambatan 15 ya'),
(8, 3, 'rendy', '083113484208', '2026-01-01', '13:00:00', 2, 'pending', '2025-12-09 13:33:35', NULL),
(9, 3, 'rendy', '083113484208', '2026-02-01', '13:00:00', 2, 'pending', '2025-12-10 00:24:33', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('MbSutPEEig9yuIuO-wCDk3NjLl92Wm8b', 1767004634, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-12-29T10:37:09.526Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":5,\"username\":\"Rendy\",\"full_name\":\"rendy\",\"role\":\"customer\"},\"cart\":[{\"menu_id\":1,\"name\":\"Ayam Geprek Original\",\"price\":15000,\"quantity\":1,\"category\":\"ayam\",\"options\":{\"spicy_level\":0,\"sambal_type\":null,\"variant\":\"tulang\"}},{\"menu_id\":3,\"name\":\"Nasi Sambal Matah\",\"price\":12000,\"quantity\":1,\"category\":\"nasi\",\"options\":{\"spicy_level\":0,\"sambal_type\":\"biasa\",\"variant\":null}},{\"menu_id\":2,\"name\":\"Ayam Geprek Mozarella\",\"price\":22000,\"quantity\":1,\"category\":\"ayam\",\"options\":{\"spicy_level\":0,\"sambal_type\":null,\"variant\":\"tulang\"}},{\"menu_id\":2,\"name\":\"Ayam Geprek Mozarella\",\"price\":22000,\"quantity\":1,\"category\":\"ayam\",\"options\":{\"spicy_level\":2,\"sambal_type\":null,\"variant\":\"tanpa_tulang\"}}],\"flash\":{},\"client_fp\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36\",\"csrfToken\":\"eb5bb6db1b9da79ac38b9a07081cb363ae11d39d7bf6351b8b2785664738b252\"}');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `invoice` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `total` int(11) NOT NULL,
  `payment_method` enum('cash','qris','debit') DEFAULT 'cash',
  `transaction_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transactions`
--

INSERT INTO `transactions` (`id`, `invoice`, `user_id`, `customer_name`, `total`, `payment_method`, `transaction_date`) VALUES
(1, 'INV-2025-001', 1, 'Budi Santoso', 45000, 'cash', '2025-12-01 17:03:06'),
(2, 'INV-2025-002', 3, 'Sari Dewi', 52000, 'qris', '2025-12-01 17:03:06'),
(3, 'CUST-20251209-283', 3, 'Mahasiswa A', 37000, 'qris', '2025-12-09 22:24:28'),
(4, 'CUST-20251210-244', 12, 'awang', 105000, 'qris', '2025-12-10 09:34:01');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaction_details`
--

CREATE TABLE `transaction_details` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `subtotal` int(11) GENERATED ALWAYS AS (`quantity` * `price`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transaction_details`
--

INSERT INTO `transaction_details` (`id`, `transaction_id`, `menu_id`, `quantity`, `price`) VALUES
(1, 1, 1, 2, 15000),
(2, 1, 4, 2, 5000),
(3, 2, 2, 1, 22000),
(4, 2, 3, 1, 12000),
(5, 2, 5, 2, 10000),
(6, 3, 1, 1, 15000),
(7, 3, 2, 1, 22000),
(8, 4, 1, 1, 15000),
(9, 4, 1, 6, 15000);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('admin','lecturer','student') DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `role`, `created_at`) VALUES
(1, 'admin', '$2a$10$HHpB60C/P6JFjB4CKrFPXeidxhTBZvMQvBDkC/chCKzly73F.z65W', 'Admin Utama', 'admin', '2025-12-01 10:03:06'),
(2, 'lecturer1', '$2a$10$HHpB60C/P6JFjB4CKrFPXeidxhTBZvMQvBDkC/chCKzly73F.z65W', 'Dosen Penguji', 'lecturer', '2025-12-01 10:03:06'),
(3, 'student1', '$2a$10$HHpB60C/P6JFjB4CKrFPXeidxhTBZvMQvBDkC/chCKzly73F.z65W', 'Mahasiswa A', 'student', '2025-12-01 10:03:06'),
(5, 'Rendy', '$2a$10$Z/U.61r1mALS1YxXwrb5p.6yGblenhw0PslgMNyZupNzsfszzAKVy', 'rendy', '', '2025-12-02 18:41:11'),
(6, 'pelanggan1', '$2a$10$Q1IiXSlqF2yha7.CV80h6O6EWDdSnvsddZGiifMr.CLs3SV7xJ2K.', 'Pelanggan Satu', 'student', '2025-12-06 09:11:44'),
(7, 'admin2', '$2a$10$EozRIQhF6BzvFcLdPGV.eeYSiJ7Qj9XquAFA0kIkmAMlCxvRsCv9O', 'Admin Dua', 'admin', '2025-12-06 09:11:59'),
(8, 'rendy12', '$2a$10$xaoTgJkZyJ273VjOgz4CEuno0pSykxCuRVvmAHfEwuI0N.Osb010K', 'rendy12', '', '2025-12-10 00:28:52'),
(9, 'rendy123', '$2a$10$9RQABB74FYjbqJkxg404AOeKX5Af7JpE5HdnQ2NLb0/Cxjdf.1SzW', 'rendy123', '', '2025-12-10 00:31:27'),
(10, 'rendy12345', '$2a$10$z1G7hcxe2Vg5OUUb4WByMuHGVBE6lpLd0C.ZFUG4IA3Zi1AbNUlZu', 'rendy123', '', '2025-12-10 01:54:26'),
(11, 'gadiel', '$2a$10$VQsiPyetsM89.eGyHnFkXObAx978nCHp00mVVucP1YXWF1wuqqso.', 'gadiel', '', '2025-12-10 02:30:13'),
(12, 'awang', '$2a$10$YE7q9DwXuNVfd0t1OQSYQuEc6s0FM0XN1033j6pFqMXPNApUMP6dC', 'awang', '', '2025-12-10 02:30:42'),
(13, 'awang123', '$2a$10$yvHlHHz6q17SCP/LC72NYeCkCvtAbPwwkT8dbbdiJ6iFk.iwgI/QC', 'awang123', '', '2025-12-10 02:31:36'),
(14, 'HAHA', '$2a$10$LKglirePEZuLe9nB5EWE/.BbJRSVyOdqkE9DDqObpWh3WBhruZ4cq', 'rendy', '', '2025-12-19 20:53:49');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `notify_whatsapp` tinyint(1) NOT NULL DEFAULT 1,
  `default_spicy_level` int(11) NOT NULL DEFAULT 0,
  `default_sambal_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`),
  ADD KEY `ip` (`ip`);

--
-- Indeks untuk tabel `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `online_orders`
--
ALTER TABLE `online_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice` (`invoice`);

--
-- Indeks untuk tabel `online_order_items`
--
ALTER TABLE `online_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indeks untuk tabel `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice` (`invoice`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indeks untuk tabel `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `menus`
--
ALTER TABLE `menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `online_orders`
--
ALTER TABLE `online_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT untuk tabel `online_order_items`
--
ALTER TABLE `online_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT untuk tabel `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `online_order_items`
--
ALTER TABLE `online_order_items`
  ADD CONSTRAINT `online_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `online_orders` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD CONSTRAINT `transaction_details_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_details_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`);

--
-- Ketidakleluasaan untuk tabel `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
