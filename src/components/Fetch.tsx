import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Form, Input, Button, message, notification, Modal, Popconfirm } from "antd";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const Fetch = () => {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm(); 
  const [editForm] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get<Post[]>("https://jsonplaceholder.typicode.com/posts")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        notification.error({
          message: "Error Fetching Data",
          description: "Unable to fetch posts from the server. Please try again later.",
        });
        setLoading(false);
      });
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Body",
      dataIndex: "body",
      key: "body",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Post) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this post?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onFinish = (values: { title: string; body: string }) => {
    setLoading(true);

    const maxId = data.length > 0 ? Math.max(...data.map((post) => post.id)) : 0;
    const newPost = {
      ...values,
      id: maxId + 1,
      userId: 1,
    };

    axios
      .post<Post>("https://jsonplaceholder.typicode.com/posts", newPost)
      .then(() => {
        setData([...data, newPost]);
        message.success("Post added successfully!");
        form.resetFields();
        setLoading(false);
      })
      .catch(() => {
        notification.error({
          message: "Error Adding Post",
          description: "Failed to add the post. Please try again later.",
        });
        setLoading(false);
      });
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    editForm.setFieldsValue(post);
    setIsEditModalVisible(true);
  };

  const handleUpdate = (values: { title: string; body: string }) => {
    if (!editingPost) return;

    const updatedPost = { ...editingPost, ...values };

    axios
      .put<Post>(`https://jsonplaceholder.typicode.com/posts/${editingPost.id}`, updatedPost)
      .then(() => {
        setData((prevData) =>
          prevData.map((post) =>
            post.id === editingPost.id ? updatedPost : post
          )
        );
        message.success("Post updated successfully!");
        setIsEditModalVisible(false);
        setEditingPost(null);
      })
      .catch(() => {
        notification.error({
          message: "Error Updating Post",
          description: "Failed to update the post. Please try again later.",
        });
      });
  };

  const handleDelete = (id: number) => {
    setLoading(true);
    axios
      .delete(`https://jsonplaceholder.typicode.com/posts/${id}`)
      .then(() => {
        setData((prevData) => prevData.filter((post) => post.id !== id));
        message.success("Post deleted successfully!");
        setLoading(false);
      })
      .catch(() => {
        notification.error({
          message: "Error Deleting Post",
          description: "Failed to delete the post. Please try again later.",
        });
        setLoading(false);
      });
  };

  return (
    <div className="container">
      <div className="mt-3">
        <h3>Fetch Data from API in React with Axios</h3>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
        />

        <h3 className="mt-4">Add New Post</h3>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ title: "", body: "" }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Enter post title" />
          </Form.Item>

          <Form.Item
            label="Body"
            name="body"
            rules={[{ required: true, message: "Body is required" }]}
          >
            <Input.TextArea placeholder="Enter post body" rows={4} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Add Post
            </Button>
          </Form.Item>
        </Form>

        {/* Modal for editing posts */}
        <Modal
          title="Edit Post"
          visible={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
        >
          <Form
            form={editForm}
            onFinish={handleUpdate}
            layout="vertical"
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input placeholder="Enter post title" />
            </Form.Item>

            <Form.Item
              label="Body"
              name="body"
              rules={[{ required: true, message: "Body is required" }]}
            >
              <Input.TextArea placeholder="Enter post body" rows={4} />
            </Form.Item>

            <Form.Item>
            <Button
  type="primary"
  htmlType="submit"
  loading={loading}
  block
  style={{
    background: "green",
    borderRadius: "8px",
    fontSize: "14px",
    padding: "6px 12px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  }}
>
  Update Post
</Button>

            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Fetch;