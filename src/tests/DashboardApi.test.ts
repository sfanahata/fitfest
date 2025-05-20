import { createMocks } from 'node-mocks-http';
import handler from '../app/api/dashboard/route';

describe('Dashboard API', () => {
  it('GET: returns dashboard summary', async () => {
    // TODO: Mock DB and session, then call handler with GET
  });

  it('handles errors gracefully', async () => {
    // TODO: Simulate DB error and check error response
  });
}); 