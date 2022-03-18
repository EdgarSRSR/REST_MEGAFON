// Эта служба Rest использует sqlite для DB и express для создания API
const sqlite3 = require('sqlite3');
const express = require("express");
var app = express();

// серверу назначается порт 8000
const HTTP_PORT = 8000
app.listen(HTTP_PORT, ()=>{
	console.log("сервер слушает порт " + HTTP_PORT);
});

// База данных создается в файле './emp_database.db'
const db = new sqlite3.Database('./emp_database.db', (err) =>{

	if (err){
		console.error("Ошибка при открытии базы данных ");
	} else {

		// таблица абонентов

		// создание таблицы
		db.run('CREATE TABLE abonenty( \
			id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
			tekushy_balans REAL NOT NULL,\
			data_dobavlenya TEXT NOT NULL,\
			vozrast INTEGER NOT NULL,\
			gorod NCHAR NOT NULL,\
			vremennaya_metka_poslednej_aktivnosty TEXT NOT NULL,\
			aktivny_tarif INTEGER NOT NULL\
			)', (err) =>{
				if (err){
					console.log("таблица  абоненты уже существует");
				}
				let insert = 'INSERT INTO abonenty (tekushy_balans, data_dobavlenya, vozrast, gorod, vremennaya_metka_poslednej_aktivnosty, aktivny_tarif) VALUES (?,?,?,?,?,?)';
				db.run(insert, [0.0, "2002-01-01", 40, "Москва", "2022-01-30 15:40:11", 1]);
				db.run(insert, [199.0, "2018-05-15", 25, "Москва", "2022-03-05 00:30:56", 2]);
			});

		// таблица тарифов

		// создание таблицы
		db.run('CREATE TABLE tarify( \
			id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
			nazvanye NCHAR NOT NULL,\
			data_nachala_dejstvya TEXT NOT NULL,\
			data_kontsa_dejstvya TEXT NOT NULL,\
			obyem_minut INTEGER NOT NULL,\
			obyem_sms INTEGER NOT NULL,\
			obyem_trafika INTEGER NOT NULL\
			)', (err) =>{
				if (err){
					console.log("таблица тарифы уже существует");
				}
				//добавление значений в таблицу
				let insert = 'INSERT INTO tarify (nazvanye, data_nachala_dejstvya, data_kontsa_dejstvya, obyem_minut, obyem_sms, obyem_trafika) VALUES (?,?,?,?,?,?)';
				db.run(insert, ["БезПрелат", "2020-01-01", "2021-01-01", 300, 150, 1024]);
				db.run(insert, ["Максимум", "2021-11-15", "2030-01-01", 800, 500, 16384]);
			});
		
		// таблица событий

		// создание таблицы
		db.run('CREATE TABLE sobytya( \
			id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
			metka_vremeni TEXT NOT NULL,\
			id_abonenta INTEGER NOT NULL,\
			tip_uslugi NCHAR NOT NULL,\
			obyem_zatrachennykh_edinits INTEGER NOT NULL\
			)', (err) =>{
				if (err){
					console.log("таблица событя уже существует");
				}
				//добавление значений в таблицу
				let insert = 'INSERT INTO sobytya (metka_vremeni, id_abonenta, tip_uslugi ,obyem_zatrachennykh_edinits) VALUES (?,?,?,?)';
				db.run(insert, ["2022-01-30 15:40:11", 1, "Звонок", 5]);
				db.run(insert, ["2022-01-30 15:40:11", 1, "смс", 1]);
			});
	}
});

// CRUD ДЛЯ АБОНЕНТОВ

// GET

// собрать отдельный абонент по id
app.get("/abonenty/:id", (req, res, next) =>{
	var params = [req.params.id]
	db.get(`SELECT * FROM abonenty WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) {
          res.status(400).json({"Ошибка":err.message});
          return;
        }
        res.status(200).json(row);
      });
});

// собрать всех абонентов
app.get("/abonenty", (req, res, next) => {
    db.all("SELECT * FROM abonenty", [], (err, rows) => {
        if (err) {
          res.status(400).json({"Ошибка":err.message});
          return;
        }
        res.status(200).json({rows});
      });
});

// POST 

// вставить абонентов
app.post("/abonenty/", (req, res, next) => {
    var reqBody = re.body;
    db.run(`INSERT INTO abonenty (tekushy_balans, data_dobavlenya, vozrast, gorod, vremennaya_metka_poslednej_aktivnosty, aktivny_tarif) VALUES (?,?,?,?,?,?)`,
        [reqBody.tekushy_balans, reqBody.data_dobavlenya, reqBody.vozrast, reqBody.gorod, reqBody.vremennaya_metka_poslednej_aktivnosty, reqBody.aktivny_tarif],
        function (err, result) {
            if (err) {
                res.status(400).json({ "Ошибка": err.message })
                return;
            }
            res.status(201).json({
                "id": this.lastID
            })
        });
});

// PUT

// обновление оппонентов
app.patch("/abonenty/", (req, res, next) => {
    var reqBody = re.body;
    db.run(`UPDATE abonenty set tekushy_balans = ?, data_dobavlenya = ?, vozrast = ?, gorod = ?, vremennaya_metka_poslednej_aktivnosty = ?, aktivny_tarif = ? WHERE id = ?`,
        [reqBody.tekushy_balans, reqBody.data_dobavlenya, reqBody.vozrast, reqBody.gorod, reqBody.vremennaya_metka_poslednej_aktivnosty, reqBody.aktivny_tarif, reqBody.id],
        function (err, result) {
            if (err) {
                res.status(400).json({ "Ошибка": res.message })
                return;
            }
            res.status(200).json({ updatedID: this.changes });
        });
});

// DELETE 

// удалить абонентов по id
app.delete("/abonenty/:id", (req, res, next) => {
    db.run(`DELETE FROM abonenty WHERE id = ?`,
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "Ошибка": res.message })
                return;
            }
            res.status(200).json({ deletedID: this.changes })
        });
});


// CRUD ДЛЯ ТАРИФОВ

// GET
// собрать отдельный тариф по id
app.get("/tarify/:id", (req, res, next) =>{
	var params = [req.params.id]
	db.get(`SELECT * FROM tarify WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) {
          res.status(400).json({"Ошибка":err.message});
          return;
        }
        res.status(200).json(row);
      });
});

// собрать всех тарифов
app.get("/tarify", (req, res, next) => {
    db.all("SELECT * FROM tarify", [], (err, rows) => {
        if (err) {
          res.status(400).json({"Ошибка":err.message});
          return;
        }
        res.status(200).json({rows});
      });
});

// POST 

// вставить тарифы
app.post("/tarify/", (req, res, next) => {
    var reqBody = re.body;
    db.run(`INSERT INTO tarify (nazvanye, data_nachala_dejstvya, data_kontsa_dejstvya, obyem_minut, obyem_sms, obyem_trafika) VALUES (?,?,?,?,?,?)`,
        [reqBody.nazvanye, reqBody.data_nachala_dejstvya, reqBody.data_kontsa_dejstvya, reqBody.obyem_minut, reqBody.obyem_sms, reqBody.obyem_trafika],
        function (err, result) {
            if (err) {
                res.status(400).json({ "Ошибка": err.message })
                return;
            }
            res.status(201).json({
                "id": this.lastID
            })
        });
});

// PUT

// обновление тарифы
app.patch("/tarify/", (req, res, next) => {
    var reqBody = re.body;
    db.run(`UPDATE tarify set nazvanye = ?, data_nachala_dejstvya = ?, data_kontsa_dejstvya = ?, obyem_minut = ?, obyem_sms = ?, obyem_trafika = ? WHERE id = ?`,
        [reqBody.nazvanye, reqBody.data_nachala_dejstvya, reqBody.data_kontsa_dejstvya, reqBody.obyem_minut, reqBody.obyem_sms, reqBody.obyem_trafika, reqBody.id],
        function (err, result) {
            if (err) {
                res.status(400).json({ "Ошибка": res.message })
                return;
            }
            res.status(200).json({ updatedID: this.changes });
        });
});

// DELETE 

// удалить терифы по id
app.delete("/tarify/:id", (req, res, next) => {
    db.run(`DELETE FROM tarify WHERE id = ?`,
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "Ошибка": res.message })
                return;
            }
            res.status(200).json({ deletedID: this.changes })
        });
});

// CRUD ДЛЯ СОБЫТЕЙ

// GET

// собрать отдельный события по id
app.get("/sobytya/:id", (req, res, next) =>{
	var params = [req.params.id]
	db.get(`SELECT * FROM sobytya WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) {
          res.status(400).json({"Ошибка":err.message});
          return;
        }
        res.status(200).json(row);
      });
});

// получить все события
app.get("/sobytya", (req, res, next) => {
    db.all("SELECT * FROM sobytya", [], (err, rows) => {
        if (err) {
          res.status(400).json({"Ошибка":err.message});
          return;
        }
        res.status(200).json({rows});
      });
});

// POST

// вставлять события
app.post("/sobytya/", (req, res, next) => {
    var reqBody = re.body;
    db.run(`INSERT INTO sobytya (metka_vremeni, id_abonenta, tip_uslugi, obyem_zatrachennykh_edinits) VALUES (?,?,?,?)`,
        [reqBody.metka_vremeni, reqBody.id_abonenta, reqBody.tip_uslugi, reqBody.obyem_zatrachennykh_edinits],
        function (err, result) {
            if (err) {
                res.status(400).json({ "Ошибка": err.message })
                return;
            }
            res.status(201).json({
                "id": this.lastID
            })
        });
});

// PUT 

// событие обновления
app.patch("/sobytya/", (req, res, next) => {
    var reqBody = re.body;
    db.run(`UPDATE sobytya set metka_vremeni = ?, id_abonenta = ?, tip_uslugi = ?, obyem_zatrachennykh_edinits = ? WHERE id = ?`,
        [reqBody.metka_vremeni, reqBody.id_abonenta, reqBody.tip_uslugi, reqBody.obyem_zatrachennykh_edinits, reqBody.id],
        function (err, result) {
            if (err) {
                res.status(400).json({ "Ошибка": res.message })
                return;
            }
            res.status(200).json({ updatedID: this.changes });
        });
});

// DELETE 

// удалить событие по id
app.delete("/sobytya/:id", (req, res, next) => {
    db.run(`DELETE FROM sobytya WHERE id = ?`,
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "Ошибка": res.message })
                return;
            }
            res.status(200).json({ deletedID: this.changes })
        });
});














