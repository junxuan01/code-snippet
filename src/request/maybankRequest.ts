import { Request, type ApiResponse } from "./../request";

const maybankRequest = new Request({
  baseURL: "https://sit-admin.maybank.lylo.tech",
  timeout: 10000, // 设置超时时间为10秒
  headers: {
    "Content-Type": "application/json",
  },
});
const login = async (params: { email: string; password: string }) => {
  return await maybankRequest.post<{ token: string }>(
    "/api/v1/admin/admin-user/login",
    params
  );
};

// 方式1：在异步函数中使用 await
const getLoginResult = async () => {
  const res = await login({
    email: "jiajun.tan@lumens.sg",
    password: "Lylo2025",
  });
  console.log("res.token", res.token); // 这里 res 就是实际的返回值 { token: string }
  return res;
};

// 调用
getLoginResult();

export interface ApiAdminPortalAdminUserListAdminUserReplyData {
  list?: ApiCommonAdminUserInfo[];
  page_count?: string;
  page_number?: string;
  page_size?: string;
  total?: string;
  [property: string]: any;
}

/**
 * api.common.AdminUserInfo
 */
export interface ApiCommonAdminUserInfo {
  created_at?: string;
  email?: string;
  id?: string;
  is_deactive?: boolean;
  is_deleted?: boolean;
  is_manager?: boolean;
  is_reviewer?: boolean;
  name?: string;
  partner_type?: string;
  updated_at?: string;
  [property: string]: any;
}

const getAdminList = async (params: {
  page_size: number;
  page_number: number;
}) => {
  return await maybankRequest.get<ApiAdminPortalAdminUserListAdminUserReplyData>(
    "/api/v1/admin/admin-user",
    { params }
  );
};

const getAdminListResult = async () => {
  const res = await getAdminList({ page_number: 1, page_size: 10 });
  console.log("res", res); // 这里 res.data 就是实际的返回值 ApiAdminPortalAdminUserListAdminUserReplyData
  return res.data;
};

// 调用
getAdminListResult();
