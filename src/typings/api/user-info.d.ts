declare namespace Api {
  namespace UserInfo {
    interface UserInfoItem {
      id: number;
      name: string;
      state: string | number;
      time: string;
      teacherName: string;
      phone: string;
    }

    interface CreateUserInfoPayload {
      name: string;
      state: string | number;
      time: string | Date;
      teacherName: string;
      phone: string;
    }
  }
}
