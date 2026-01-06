import React, { useState, useEffect } from "react";
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../../../service/auth/Login";
import type { CreateUserData, UserData } from "../../../service/auth/Login";

const Create_Supervisor_and_Admin: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "Employee",
    position: "IT",
    department: "CX",
    base_salary: 0,
    start_date: "",
    status: "Active",
  });

  const [users, setUsers] = useState<UserData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.users);
    } catch (error: any) {
      showMessage("error", error.message);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "base_salary" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await updateUser(editingId, formData);
        showMessage("success", "User updated successfully!");
        setEditingId(null);
      } else {
        await createUser(formData);
        showMessage("success", "User created successfully!");
      }

      resetForm();
      fetchUsers();
    } catch (error: any) {
      showMessage("error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserData) => {
    setFormData({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      password: "",
      role: user.role,
      position: user.position,
      department: user.department,
      base_salary: user.base_salary,
      start_date: user.start_date.split("T")[0],
      status: user.status,
    });
    setEditingId(user._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        showMessage("success", "User deleted successfully!");
        fetchUsers();
      } catch (error: any) {
        showMessage("error", error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      lastname: "",
      email: "",
      password: "",
      role: "Employee",
      position: "IT",
      department: "CX",
      base_salary: 0,
      start_date: "",
      status: "Active",
    });
    setEditingId(null);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>User Management System</h1>

      {message && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "4px",
            backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${
              message.type === "success" ? "#c3e6cb" : "#f5c6cb"
            }`,
          }}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h2>{editingId ? "Edit User" : "Create New User"}</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Name:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Last Name:
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Password {editingId && "(leave blank to keep current)"}:
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!editingId}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Role:
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="Employee">Employee</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Position:
            </label>
            <select
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="IT">IT</option>
              <option value="CONTENT">CONTENT</option>
              <option value="SSD">SSD</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Department:
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="CX">CX</option>
              <option value="LCC">LCC</option>
              <option value="DDS">DDS</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Base Salary:
            </label>
            <input
              type="number"
              name="base_salary"
              value={formData.base_salary}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Start Date:
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Status:
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Processing..."
              : editingId
              ? "Update User"
              : "Create User"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h2>Users List ({users.length})</h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#343a40", color: "white" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>User ID</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Email</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Role</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Position</th>
                <th style={{ padding: "10px", textAlign: "left" }}>
                  Department
                </th>
                <th style={{ padding: "10px", textAlign: "left" }}>Salary</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user._id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                  }}
                >
                  <td style={{ padding: "10px" }}>
                    {user.name} {user.lastname}
                  </td>
                  <td style={{ padding: "10px" }}>{user.email}</td>
                  <td style={{ padding: "10px" }}>{user.role}</td>
                  <td style={{ padding: "10px" }}>{user.position}</td>
                  <td style={{ padding: "10px" }}>{user.department}</td>
                  <td style={{ padding: "10px" }}>
                    ${user.base_salary.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          user.status === "Active"
                            ? "#28a745"
                            : user.status === "Inactive"
                            ? "#dc3545"
                            : "#ffc107",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{
                        padding: "5px 10px",
                        marginRight: "5px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Create_Supervisor_and_Admin;
