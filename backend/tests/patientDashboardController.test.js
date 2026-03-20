const { getHospitals } = require('../controllers/patientDashboardController');
const Hospital = require('../models/Hospital');

jest.mock('../models/Hospital');

describe('Patient Dashboard Controller Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getHospitals', () => {
        it('should fetch all active hospitals and return them', async () => {
            const mockHospitals = [
                { name: 'Bir Hospital', address: 'KTM', departments: [] },
                { name: 'Teaching Hospital', address: 'KTM', departments: [] }
            ];

            const sortMock = jest.fn().mockResolvedValue(mockHospitals);
            const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
            Hospital.find.mockReturnValue({ select: selectMock });

            await getHospitals(req, res);

            expect(Hospital.find).toHaveBeenCalledWith({ isActive: true });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockHospitals
            });
        });

        it('should handle database errors gracefully', async () => {
            // Mock console.error to keep the test output clean since we expect this error
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const sortMock = jest.fn().mockRejectedValue(new Error('DB Error'));
            const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
            Hospital.find.mockReturnValue({ select: selectMock });

            await getHospitals(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error fetching hospitals'
            });

            consoleSpy.mockRestore();
        });
    });
});
