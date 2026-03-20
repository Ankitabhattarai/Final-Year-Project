const { login, register } = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

jest.mock('../models/User');
jest.mock('jsonwebtoken');

describe('Auth Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('Register', () => {
        it('should return 400 if required fields are missing', async () => {
            req.body = { email: 'test@test.com' };
            await register(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Please provide all required fields'
            });
        });

        it('should return 400 if passwords do not match', async () => {
            req.body = { fullName: 'Test', email: 'test@test.com', password: 'password123', confirmPassword: 'password456' };
            await register(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Passwords do not match' }));
        });

        it('should register a new user successfully', async () => {
            req.body = { fullName: 'Test', email: 'test@test.com', password: 'password123', confirmPassword: 'password123' };
            User.findOne.mockResolvedValue(null);
            
            const saveMock = jest.fn().mockResolvedValue(true);
            User.mockImplementation(() => ({
                _id: 'user123',
                fullName: 'Test',
                email: 'test@test.com',
                role: 'patient',
                save: saveMock
            }));

            jwt.sign.mockReturnValue('mocked-token');

            await register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'User registered successfully',
                token: 'mocked-token'
            }));
        });
    });

    describe('Login', () => {
        it('should return 400 if credentials missing', async () => {
            req.body = { email: 'test@test.com' };
            await login(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Please provide email and password' }));
        });

        it('should return 400 for invalid email', async () => {
            req.body = { email: 'wrong@test.com', password: 'password123' };
            
            // Mocking chained populate method
            const populateMock = jest.fn().mockResolvedValue(null);
            User.findOne.mockReturnValue({ populate: populateMock });

            await login(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid email or password' }));
        });

        it('should login successfully with valid credentials', async () => {
            req.body = { email: 'test@test.com', password: 'password123' };
            
            const mockUser = {
                _id: 'user123',
                fullName: 'Test',
                email: 'test@test.com',
                role: 'patient',
                comparePassword: jest.fn().mockResolvedValue(true)
            };

            const populateMock = jest.fn().mockResolvedValue(mockUser);
            User.findOne.mockReturnValue({ populate: populateMock });
            jwt.sign.mockReturnValue('mocked-token');

            await login(req, res);

            expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Login successful',
                token: 'mocked-token'
            }));
        });
    });
});
