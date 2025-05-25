const express = require("express");
const mysql = require("mysql2/promise");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
    },
});

const PORT = 3000;

app.use(cors());
app.use(express.json());

let db;
(async () => {
    db = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "02122002",
        database: "app-project"
    });
})();

// Kullanıcı kayıt
app.post("/register", async (req, res) => {
    const { username, password, imageUrl } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "Eksik bilgi: Kullanıcı adı ve şifre gereklidir." });

    try {
        const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length > 0)
            return res.status(409).json({ message: "Kullanıcı zaten var" });

        await db.execute(
            "INSERT INTO users (username, password, profile_image_url) VALUES (?, ?, ?)",
            [username, password, imageUrl || null]
        );
        
        const [userRows] = await db.execute("SELECT id, username, profile_image_url FROM users WHERE username = ?", [username]);
        if (userRows.length > 0) {
            res.json({ message: "Kayıt başarılı", user: userRows[0] });
        } else {
            res.status(500).json({ message: "Kayıt sonrası kullanıcı bulunamadı." });
        }
    } catch (error) {
        console.error("Kayıt sırasında hata:", error);
        res.status(500).json({ message: "Sunucu hatası: Kayıt yapılamadı." });
    }
});

// Kullanıcı giriş
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);

    if (rows.length === 0)
        return res.status(401).json({ message: "Giriş başarısız" });

    res.json({ message: "Giriş başarılı", user: rows[0] });
});

// Sohbet listesi
app.get("/my-conversations", async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: "Username gerekli" });

    try {
        const [[user]] = await db.execute("SELECT id FROM users WHERE username = ?", [username]);
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        const [rows] = await db.execute(`
            SELECT c.id AS conversation_id,
                   u.username AS partner_username,
                   u.profile_image_url AS partner_profile_image_url
            FROM conversations c
            JOIN users u ON (u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id))
            WHERE c.user1_id = ? OR c.user2_id = ?
        `, [user.id, user.id, user.id]);

        console.log("[/my-conversations] rows:", rows); // 🔍 BU SATIRI EKLE

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});


// SOCKET.IO
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("📡 Yeni bağlantı:", socket.id);

    socket.on("login", (username) => {
        console.log("🔐 Kullanıcı giriş yaptı:", username);
        onlineUsers.set(username, socket.id);
    });

    socket.on("join_conversation", async (conversationId) => {
        try {
            socket.join(`conversation_${conversationId}`);
            console.log(`➕ ${socket.id} joined conversation_${conversationId}`);

            const [messages] = await db.execute(
                "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC",
                [conversationId]
            );

            socket.emit("conversation_history", messages);
        } catch (err) {
            console.error("❌ join_conversation hatası:", err);
        }
    });

    socket.on("start_conversation", async ({ fromUser, toUser }) => {
        try {
            const [[from]] = await db.execute("SELECT id FROM users WHERE username = ?", [fromUser]);
            const [[to]] = await db.execute("SELECT id FROM users WHERE username = ?", [toUser]);

            if (!from || !to) return;

            const [rows] = await db.execute(
                `SELECT * FROM conversations 
                 WHERE (user1_id = ? AND user2_id = ?) 
                 OR (user1_id = ? AND user2_id = ?)`,
                [from.id, to.id, to.id, from.id]
            );

            let conversationId;
            if (rows.length > 0) {
                conversationId = rows[0].id;
            } else {
                const [result] = await db.execute(
                    "INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)",
                    [from.id, to.id]
                );
                conversationId = result.insertId;
            }

            socket.join(`conversation_${conversationId}`);
            socket.emit("conversation_ready", { conversationId });

            const [messages] = await db.execute(
                "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC",
                [conversationId]
            );

            socket.emit("conversation_history", messages);
        } catch (err) {
            console.error("❌ start_conversation hatası:", err);
        }
    });

    socket.on("send_message", async ({ conversationId, fromUser, message }) => {
        try {
            console.log("📩 Yeni mesaj:", { conversationId, fromUser, message });

            const [[sender]] = await db.execute("SELECT id FROM users WHERE username = ?", [fromUser]);
            if (!sender) return;

            const [result] = await db.execute(
                "INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)",
                [conversationId, sender.id, message]
            );

            const msgData = {
                id: result.insertId,
                sender_id: sender.id,
                text: message,
                timestamp: new Date(),
            };

            io.to(`conversation_${conversationId}`).emit("new_message", msgData);
        } catch (err) {
            console.error("❌ send_message hatası:", err);
        }
    });

    socket.on("disconnect", () => {
        for (const [username, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                onlineUsers.delete(username);
                break;
            }
        }
        console.log("⛔ Bağlantı kapandı:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
});

app.post("/update-profile-image", async (req, res) => {
    const { username, imageUrl } = req.body;
    if (!username || !imageUrl)
        return res.status(400).json({ message: "Eksik bilgi" });

    try {
        await db.execute(
            "UPDATE users SET profile_image_url = ? WHERE username = ?",
            [imageUrl, username]
        );
        res.json({ message: "Profil fotoğrafı güncellendi" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

app.get("/get-profile-image", async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ message: "Kullanıcı adı gerekli" });
    }

    try {
        const [rows] = await db.execute(
            "SELECT profile_image_url FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        res.json({ imageUrl: rows[0].profile_image_url });
    } catch (err) {
        console.error("Profil fotoğrafı getirme hatası:", err);
        res.status(500).json({ message: "Sunucu hatası" });
    }
});

app.post("/change-password", async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Eksik bilgi: Kullanıcı adı, mevcut şifre ve yeni şifre gereklidir." });
    }

    try {
        const [rows] = await db.execute(
            "SELECT password FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        const user = rows[0];

        // Mevcut şifreyi kontrol et (Basit bir karşılaştırma, normalde hashlenmiş şifre kontrolü yapılmalı)
        if (user.password !== currentPassword) {
            return res.status(401).json({ message: "Mevcut şifre yanlış." });
        }

        // Yeni şifreyi güncelle
        await db.execute(
            "UPDATE users SET password = ? WHERE username = ?",
            [newPassword, username]
        );

        res.json({ message: "Şifre başarıyla güncellendi." });

    } catch (err) {
        console.error("Şifre değiştirme hatası:", err);
        res.status(500).json({ message: "Sunucu hatası." });
    }
});