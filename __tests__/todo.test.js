const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');
const Todo = require('../lib/models/Todo');

const mockUser = {
  firstName: 'momo',
  lastName: 'cat',
  email: 'momo@momo.com',
  password: 'momomomo',
};
const mockUser2 = {
  firstName: 'Stu',
  lastName: 'Cat',
  email: 'stu@stu.com',
  password: 'stuthecat',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  // Create an "agent" that gives us the ability
  // to store cookies between requests in a test
  const agent = request.agent(app);

  // Create a user to sign in with
  const user = await UserService.create({ ...mockUser, ...userProps });

  // ...then sign in
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('todos', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('GET /api/v1/todos returns all todos associated with the authenticated User', async () => {
    const [agent, user] = await registerAndLogin();
    const user2 = await UserService.create(mockUser2);
    const user1Todo = await Todo.insert({
      description: 'do the dishes',
      user_id: user.id,
    });
    await Todo.insert({
      description: 'walk the dog',
      user_id: user2.id,
    });
    const resp = await agent.get('/api/v1/todos');
    console.log(resp.body);
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual([user1Todo]);
  });

  it('POST /api/v1/todos creates a new todo with the current user', async () => {
    const [agent, user] = await registerAndLogin();
    const newTodo = { description: 'walk the dog' };
    const resp = await agent.post('/api/v1/todos').send(newTodo);
    expect(resp.status).toEqual(200);
    expect(resp.body).toEqual({
      id: expect.any(String),
      description: newTodo.description,
      user_id: user.id,
      completed: false,
    });
  });
});
