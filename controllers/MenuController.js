const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const db = require('../config/database');

const pool = db.promise();

const deleteFile = (filePath) => {
  if (!filePath) return;
  const absolutePath = path.join(__dirname, '..', 'public', 'uploads', filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

const MenuController = {
  async index(req, res) {
    try {
      const [menus] = await pool.query('SELECT * FROM menus ORDER BY created_at DESC');
      res.render('admin/menu/index', {
        title: 'Menu Management',
        page: 'menu',
        menus,
        headerButtons: '<a href="/admin/menu/create" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah Menu</a>',
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal mengambil data menu');
      res.redirect('/admin');
    }
  },

  createForm(req, res) {
    res.render('admin/menu/create', {
      title: 'Tambah Menu',
      page: 'menu',
    });
  },

  async store(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', errors.array()[0].msg);
      return res.redirect('/admin/menu/create');
    }

    const { name, category, price, description, spicy_level, variant, is_available } = req.body;
    const image = req.file ? req.file.filename : 'default-menu.svg';

    try {
      await pool.query(
        `INSERT INTO menus (name, category, price, description, spicy_level, variant, image, is_available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          category,
          price,
          description,
          spicy_level || 0,
          variant || null,
          image,
          is_available === 'on',
        ]
      );
      req.flash('success_msg', 'Menu berhasil ditambahkan');
      res.redirect('/admin/menu');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal menambahkan menu');
      res.redirect('/admin/menu');
    }
  },

  async editForm(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [req.params.id]);
      if (!rows.length) {
        req.flash('error_msg', 'Menu tidak ditemukan');
        return res.redirect('/admin/menu');
      }

      res.render('admin/menu/edit', {
        title: 'Edit Menu',
        page: 'menu',
        menu: rows[0],
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal memuat form edit');
      res.redirect('/admin/menu');
    }
  },

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', errors.array()[0].msg);
      return res.redirect(`/admin/menu/edit/${req.params.id}`);
    }

    const { name, category, price, description, spicy_level, variant, is_available } = req.body;

    try {
      const [rows] = await pool.query('SELECT image FROM menus WHERE id = ?', [req.params.id]);
      if (!rows.length) {
        req.flash('error_msg', 'Menu tidak ditemukan');
        return res.redirect('/admin/menu');
      }

      let image = rows[0].image;
      if (req.file) {
        deleteFile(image);
        image = req.file.filename;
      }

      await pool.query(
        `UPDATE menus SET name=?, category=?, price=?, description=?, spicy_level=?, variant=?, image=?, is_available=?
         WHERE id=?`,
        [
          name,
          category,
          price,
          description,
          spicy_level || 0,
          variant || null,
          image,
          is_available === 'on',
          req.params.id,
        ]
      );

      req.flash('success_msg', 'Menu berhasil diperbarui');
      res.redirect('/admin/menu');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal memperbarui menu');
      res.redirect('/admin/menu');
    }
  },

  async destroy(req, res) {
    try {
      const [rows] = await pool.query('SELECT image FROM menus WHERE id = ?', [req.params.id]);
      if (!rows.length) {
        req.flash('error_msg', 'Menu tidak ditemukan');
        return res.redirect('/admin/menu');
      }

      if (rows[0].image && rows[0].image !== 'default-menu.svg') {
        deleteFile(rows[0].image);
      }

      await pool.query('DELETE FROM menus WHERE id = ?', [req.params.id]);
      req.flash('success_msg', 'Menu berhasil dihapus');
      res.redirect('/admin/menu');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Gagal menghapus menu');
      res.redirect('/admin/menu');
    }
  },
};

module.exports = MenuController;

