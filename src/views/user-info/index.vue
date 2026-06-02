<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { fetchCreateUserInfo, fetchDeleteUserInfo, fetchUserInfoList } from '@/service/api';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
const keyword = ref('');
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();
const tableData = ref<Api.UserInfo.UserInfoItem[]>([]);
const createForm = reactive<Api.UserInfo.CreateUserInfoPayload>({
  name: '',
  state: '1',
  time: '',
  teacherName: '',
  phone: ''
});
const dialogVisible = ref(false);
const stateOptions = ref<CommonType.Option<string, string>[]>([
  { label: '存续', value: '1' },
  { label: '注销', value: '0' }
]);
const handleClose = () => {
  dialogVisible.value = false;
  createForm.name = '';
  createForm.state = '1';
  createForm.time = '';
  createForm.teacherName = '';
  createForm.phone = '';
};
const cancelForm = () => {
  ruleFormRef.value?.resetFields();
  dialogVisible.value = false;
};
async function handleFetchList() {
  loading.value = true;
  try {
    tableData.value = await fetchUserInfoList(keyword.value);
  } catch (error: any) {
    ElMessage.error(error?.message || '获取用户列表失败');
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  keyword.value = '';
  void handleFetchList();
}
const rules = reactive<Record<keyof typeof createForm, App.Global.FormRule[]>>({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  teacherName: [{ required: true, message: '请输入老师姓名', trigger: 'blur' }],
  time: [{ required: true, message: '请输入时间', trigger: 'blur' }],
  state: [{ required: true, message: '请选择状态', trigger: 'blur' }]
});
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  console.log('1111');

  await formEl.validate(async (valid, fields) => {
    if (valid) {
      try {
        await fetchCreateUserInfo(createForm);
        ElMessage.success('新增成功');
        cancelForm();
        await handleFetchList();
      } catch (error: any) {
        ElMessage.error(error?.message || '新增失败');
      }
    } else {
      console.log('2222');

      console.log('error submit!', fields);
    }
  });
};
async function handleCreate() {
  dialogVisible.value = true;
  return;
}

async function handleDelete(id: number) {
  try {
    await fetchDeleteUserInfo(id);
    ElMessage.success('删除成功');
    await handleFetchList();
  } catch (error: any) {
    ElMessage.error(error?.message || '删除失败');
  }
}

onMounted(() => {
  void handleFetchList();
});
</script>

<template>
  <ElCard shadow="never" class="card-wrapper">
    <div class="mb-16px flex items-center gap-12px">
      <ElInput v-model="keyword" placeholder="请输入姓名/老师姓名/手机号" clearable class="w-300px" />
      <ElButton type="primary" @click="handleFetchList">搜索</ElButton>
      <ElButton @click="handleReset">重置</ElButton>
    </div>

    <div class="mb-16px flex flex-wrap items-center gap-12px">
      <ElButton type="success" @click="handleCreate">新增</ElButton>
    </div>

    <ElTable v-loading="loading" :data="tableData" border stripe>
      <ElTableColumn prop="id" label="ID" width="80" />
      <ElTableColumn prop="name" label="姓名" min-width="140" />
      <ElTableColumn prop="state" label="状态" min-width="100">
        <template #default="{ row }">
          <ElTag :type="row.state === '1' ? 'success' : 'danger'">{{ row.state === '1' ? '存续' : '注销' }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="time" label="时间" min-width="180" />
      <ElTableColumn prop="teacherName" label="老师姓名" min-width="160" />
      <ElTableColumn prop="phone" label="手机号" min-width="160" />
      <ElTableColumn label="操作" width="120">
        <template #default="{ row }">
          <ElPopconfirm title="确认删除该用户吗？" @confirm="handleDelete(row.id)">
            <template #reference>
              <ElButton type="danger" link>删除</ElButton>
            </template>
          </ElPopconfirm>
        </template>
      </ElTableColumn>
    </ElTable>
    <ElDialog v-model="dialogVisible" title="新增用户信息" width="500" :before-close="handleClose">
      <div>
        <div class="mb-16px flex flex-wrap items-center gap-12px">
          <ElForm ref="ruleFormRef" :model="createForm" class="demo-form-inline" style="width: 100%" :rules="rules">
            <ElFormItem label="姓名" label-position="top" prop="name">
              <ElInput v-model="createForm.name" placeholder="姓名" clearable />
            </ElFormItem>
            <ElFormItem label="手机号" label-position="top" prop="phone">
              <ElInput v-model="createForm.phone" placeholder="手机号" clearable />
            </ElFormItem>
            <ElFormItem label="老师姓名" label-position="top" prop="teacherName">
              <ElInput v-model="createForm.teacherName" placeholder="老师姓名" clearable />
            </ElFormItem>
            <ElFormItem label="状态" label-position="top">
              <ElSelect v-model="createForm.state" placeholder="状态" clearable>
                <ElOption label="存续" value="1" />
                <ElOption label="注销" value="0" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="时间" label-position="top" prop="time">
              <ElDatePicker
                v-model="createForm.time"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                type="date"
                placeholder="请选择日期"
                style="width: 100%"
              />
            </ElFormItem>
          </ElForm>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="cancelForm">取消</ElButton>
          <ElButton type="primary" @click="submitForm(ruleFormRef)">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </ElCard>
</template>
