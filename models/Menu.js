const db = require('../config/database');

class Menu {
  static findAll(callback) {
    db.query('SELECT * FROM menus ORDER BY created_at DESC', callback);
  }

  static findById(id, callback) {
    db.query('SELECT * FROM menus WHERE id = ?', [id], callback);
  }

  static create(data, callback) {
    db.query('INSERT INTO menus SET ?', data, callback);
  }

  static update(id, data, callback) {
    db.query('UPDATE menus SET ? WHERE id = ?', [data, id], callback);
  }

  static delete(id, callback) {
    db.query('DELETE FROM menus WHERE id = ?', [id], callback);
  }

  static search(keyword, callback) {
    db.query(
      'SELECT * FROM menus WHERE name LIKE ? OR description LIKE ?',
      [`%${keyword}%`, `%${keyword}%`],
      callback
    );
  }

  static findByCategory(category, callback) {
    db.query('SELECT * FROM menus WHERE category = ?', [category], callback);
  }
}

module.exports = Menu;