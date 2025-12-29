import React, { useEffect, useState } from 'react';
import db from '../db/db';
import { useNavigate } from 'react-router-dom';

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await db.users.toArray();
      console.log('Fetched users:', allUsers);
      setUsers(allUsers || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await db.users.delete(id);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };
   const handleUpdate = async (id) => {
  try {
    await db.users.update(id, {
      name: 'Updated Name',
      updatedAt: new Date()
    });
    fetchUsers();
  } catch (error) {
    console.error('Error updating user:', error);
  }
};


  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  };

  const thStyle = {
    backgroundColor: '#1976d2',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid #1565c0'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #ddd'
  };

  const rowHoverStyle = {
    backgroundColor: '#f5f5f5'
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#333', margin: 0 }}>Registered Users</h2>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1565c0'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
          >
            Add New User
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '16px', color: '#666' }}>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '16px', color: '#666' }}>No users registered yet</p>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Create First User
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px', color: '#666' }}>
              <strong>Total Users: {users.length}</strong>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: '#1976d2' }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Age</th>
                    <th style={thStyle}>Created At</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={tdStyle}>{user.id}</td>
                      <td style={tdStyle}><strong>{user.name}</strong></td>
                      <td style={tdStyle}>{user.email}</td>
                      <td style={tdStyle}>{user.phone}</td>
                      <td style={tdStyle}>{user.age}</td>
                      <td style={tdStyle}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleDelete(user.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#c62828'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#d32f2f'}
                        >
                          Delete
                        </button>
                           <button
                          onClick={() => handleUpdate(user)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#c62828'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#d32f2f'}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersList;
