import { createRequest } from './createInstance';

/**
 * 演示如何使用 Request 类的示例代码
 */

// 创建一个请求实例
const api = createRequest({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 定义响应数据类型
interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListResponse {
  users: User[];
  total: number;
}

// 使用 GET 请求获取用户列表
async function getUsers() {
  try {
    const response = await api.get<UserListResponse>(
      '/users',
      {
        page: 1,
        limit: 10,
      },
      {
        requestId: 'get-users', // 设置请求ID
        cancelPrevious: true, // 取消之前同ID的请求
      }
    );

    console.log('用户列表:', response.users);
    return response;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return null;
  }
}

// 使用 POST 请求创建新用户
async function createUser(userData: Omit<User, 'id'>) {
  try {
    const newUser = await api.post<User>('/users', userData);
    console.log('创建的用户:', newUser);
    return newUser;
  } catch (error) {
    console.error('创建用户失败:', error);
    return null;
  }
}

// 使用 PUT 请求更新用户
async function updateUser(id: number, userData: Partial<User>) {
  try {
    const updatedUser = await api.put<User>(`/users/${id}`, userData);
    console.log('更新后的用户:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('更新用户失败:', error);
    return null;
  }
}

// 使用 DELETE 请求删除用户
async function deleteUser(id: number) {
  try {
    await api.delete(`/users/${id}`);
    console.log('成功删除用户:', id);
    return true;
  } catch (error) {
    console.error('删除用户失败:', error);
    return false;
  }
}

// 手动取消请求示例
function cancelRequestExample() {
  // 发起请求
  const fetchData = api.get('/users', {}, { requestId: 'users-data' });

  // 立即取消请求
  api.cancelRequest('users-data', '用户取消了请求');

  // fetchData 的 Promise 将被拒绝，错误信息为 "用户取消了请求"
}

export { cancelRequestExample, createUser, deleteUser, getUsers, updateUser };
