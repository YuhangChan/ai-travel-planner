import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Space,
  Tag,
  Progress,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import { planService } from '@/services/plan';
import { Expense } from '@/types';
import dayjs from 'dayjs';
import VoiceInput from './VoiceInput';

const { TextArea } = Input;

interface ExpenseTrackerProps {
  planId: string;
  budget: number;
}

const categoryColors: Record<string, string> = {
  accommodation: 'blue',
  transportation: 'green',
  food: 'orange',
  activities: 'purple',
  shopping: 'pink',
  other: 'default',
};

const categoryNames: Record<string, string> = {
  accommodation: '住宿',
  transportation: '交通',
  food: '餐饮',
  activities: '活动',
  shopping: '购物',
  other: '其他',
};

export default function ExpenseTracker({ planId, budget }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadExpenses();
  }, [planId]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await planService.getExpenses(planId);
      setExpenses(data);
    } catch (error: any) {
      message.error('加载费用记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingExpense(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    form.setFieldsValue({
      ...expense,
      date: dayjs(expense.date),
    });
    setModalVisible(true);
  };

  const handleDelete = (expense: Expense) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条费用记录吗？',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await planService.deleteExpense(expense.id);
          message.success('删除成功');
          loadExpenses();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const expenseData = {
        ...values,
        plan_id: planId,
        date: values.date.format('YYYY-MM-DD'),
      };

      if (editingExpense) {
        await planService.updateExpense(editingExpense.id, expenseData);
        message.success('更新成功');
      } else {
        await planService.addExpense(expenseData);
        message.success('添加成功');
      }

      setModalVisible(false);
      loadExpenses();
    } catch (error: any) {
      message.error(editingExpense ? '更新失败' : '添加失败');
    }
  };

  const handleVoiceResult = (transcript: string) => {
    // 简单解析语音输入，提取金额和描述
    // 例如："花了200元吃午饭" -> amount: 200, description: "吃午饭"
    form.setFieldsValue({
      description: transcript,
    });
    message.success('语音识别成功！请完善其他信息');
    setShowVoiceInput(false);
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetUsage = (totalExpense / budget) * 100;

  const categoryBreakdown = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={categoryColors[category]}>
          {categoryNames[category]}
        </Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Expense) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总预算"
              value={budget}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已花费"
              value={totalExpense}
              prefix="¥"
              valueStyle={{ color: budgetUsage > 100 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="剩余预算"
              value={budget - totalExpense}
              prefix="¥"
              valueStyle={{ color: budget - totalExpense < 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>预算使用情况：</strong>
        </div>
        <Progress
          percent={Math.min(budgetUsage, 100)}
          status={budgetUsage > 100 ? 'exception' : budgetUsage > 80 ? 'normal' : 'success'}
          format={() => `${budgetUsage.toFixed(1)}%`}
        />
        {budgetUsage > 100 && (
          <div style={{ color: '#cf1322', marginTop: 8 }}>
            ⚠️ 已超出预算 ¥{(totalExpense - budget).toLocaleString()}
          </div>
        )}
      </Card>

      {Object.keys(categoryBreakdown).length > 0 && (
        <Card title="费用分类" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            {Object.entries(categoryBreakdown).map(([category, amount]) => (
              <Col span={8} key={category}>
                <Tag color={categoryColors[category]} style={{ marginBottom: 4 }}>
                  {categoryNames[category]}
                </Tag>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                  ¥{amount.toLocaleString()}
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      <Card
        title="费用记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加费用
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={expenses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingExpense ? '编辑费用' : '添加费用'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select size="large">
              {Object.entries(categoryNames).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  <Tag color={categoryColors[key]}>{value}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="金额（元）"
            name="amount"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              size="large"
              min={0}
              style={{ width: '100%' }}
              formatter={(value) =>
                `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
            />
          </Form.Item>

          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker size="large" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label={
              <span>
                说明
                <Button
                  type="link"
                  icon={<AudioOutlined />}
                  onClick={() => setShowVoiceInput(true)}
                >
                  语音输入
                </Button>
              </span>
            }
            name="description"
            rules={[{ required: true, message: '请输入说明' }]}
          >
            <TextArea rows={3} placeholder="描述这笔费用..." />
          </Form.Item>

          <Form.Item name="currency" initialValue="CNY" hidden>
            <Input />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingExpense ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {showVoiceInput && (
        <VoiceInput
          onResult={handleVoiceResult}
          onClose={() => setShowVoiceInput(false)}
        />
      )}
    </div>
  );
}
