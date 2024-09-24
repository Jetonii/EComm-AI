
const getAllUsers = async (req, res) => {
    try {
        const users = { "user1": "jeton", "user2": "albion" }
        res.status(200).json(users); 
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addUser = async (req, res) => {
    let users = {}
    try {
        users["user3"] = "valon";
        res.status(201).json("added successfully!");
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllUsers, addUser
}