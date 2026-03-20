const { getQueueList } = require('../controllers/queueController');
const Queue = require('../models/Queue');

jest.mock('../models/Queue');
jest.mock('../utils/waitTimeUtils', () => ({
    estimateWaitTime: jest.fn().mockResolvedValue(15)
}));

describe('Queue Controller Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            hospitalId: 'hospital123'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getQueueList', () => {
        it('should fetch paginated queue entries for a hospital', async () => {
            req.query = { page: 1, limit: 10 };
            
            const mockQueues = [{ id: 'q1' }, { id: 'q2' }];
            
            const limitMock = jest.fn().mockResolvedValue(mockQueues);
            const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
            const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
            const populateMock2 = jest.fn().mockReturnValue({ sort: sortMock });
            const populateMock1 = jest.fn().mockReturnValue({ populate: populateMock2 });
            
            Queue.find.mockReturnValue({ populate: populateMock1 });
            Queue.countDocuments.mockResolvedValue(2);

            await getQueueList(req, res);

            expect(Queue.countDocuments).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    queues: mockQueues,
                    pagination: {
                        current: 1,
                        pages: 1,
                        total: 2
                    }
                }
            });
        });
    });
});
