
const authController = {
    signup: async (req, res) => {
        const {name, email, password, device} = req.body;

        // Check if user already exists
        const userExists = users.find((user) => user.email === email);
        if (userExists) {
            return res.status(400).json({message: 'User already exists'});
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user object
        const now = Date.now();
        const id = now.toString();
        const user = {
            id,
            name,
            email,
            password: hashedPassword,
            device,
            createdAt: now,
            lastLoginAt: now,
        };

        // Save user to memory
        users.push(user);

        // Generate JWT token
        const token = authController.generateToken(user);

        // res.status(201).json({message: 'User created successfully', token});
        res.status(201).json({
            success: true,
            statusCode: 201,
            data: {
                token,
                profile: user,
            }
        });
    },


    login: async (req, res) => {
        const {email, password, device} = req.body;

        // Find user by email
        const user = users.find((user) => user.email === email);
        if (!user) {
            return res.status(400).json({message: 'Invalid email or password'});
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({message: 'Invalid email or password'});
        }

        // Update last login
        user.lastLogin = Date.now();

        // Generate JWT token
        const token = authController.generateToken(user);

        res.status(200).json({
            success: true,
            statusCode: 200,
            data: {
                token,
                profile: user,
            }
        });
    }
};


module.exports = authController;
