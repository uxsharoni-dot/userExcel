import { supabase } from '../supabase/client';

const TABLE_NAME = 'user';

function normalizeTimeValue(input: string | Date) {
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    const hour = String(input.getHours()).padStart(2, '0');
    const minute = String(input.getMinutes()).padStart(2, '0');
    const second = String(input.getSeconds()).padStart(2, '0');
    return `${hour}:${minute}:${second}`;
  }

  const value = String(input).trim();

  if (!value) return value;

  // 12.12 -> 12:12:00
  if (/^\d{1,2}\.\d{1,2}$/.test(value)) {
    const [hour, minute] = value.split('.');
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  }

  // 12:12 -> 12:12:00
  if (/^\d{1,2}:\d{1,2}$/.test(value)) {
    const [hour, minute] = value.split(':');
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  }

  return value;
}

export async function fetchUserInfoList(keyword = '') {
  let query = supabase.from(TABLE_NAME).select('*').order('id', { ascending: true });

  const value = keyword.trim();

  if (value) {
    query = query.or(`name.ilike.%${value}%,teacherName.ilike.%${value}%,phone.ilike.%${value}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data as Api.UserInfo.UserInfoItem[];
}

export async function fetchCreateUserInfo(payload: Api.UserInfo.CreateUserInfoPayload) {
  const insertPayload = {
    ...payload,
    time: normalizeTimeValue(payload.time)
  };

  const { data, error } = await supabase.from(TABLE_NAME).insert(insertPayload).select('*').single();

  if (error) {
    throw error;
  }

  return data as Api.UserInfo.UserInfoItem;
}

export async function fetchDeleteUserInfo(id: number) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    throw error;
  }
}
