import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import dashboardService from '../services/dashboardService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d'];

  const formatGenderData = (data) => {
    return data?.map(item => ({
      name: item.gender,
      value: parseInt(item.count)
    })) || [];
  };

  const formatClassData = (data) => {
    return data?.map(item => ({
      name: item.class_name,
      students: parseInt(item.student_count)
    })) || [];
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card className="stat-card h-100">
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className={`stat-icon bg-${color}-soft text-${color}`}>
            <i className={`bi ${icon}`}></i>
          </div>
          <div className="ms-3">
            <h6 className="text-muted mb-1">{title}</h6>
            <h3 className="mb-0">{value}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Dashboard</h4>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col xl={3} md={6}>
          <StatCard
            title="Total Students"
            value={stats?.summary?.total_students || 0}
            icon="bi-people"
            color="primary"
            subtitle="All time admissions"
          />
        </Col>
        <Col xl={3} md={6}>
          <StatCard
            title="Active Students"
            value={stats?.summary?.active_students || 0}
            icon="bi-person-check"
            color="success"
            subtitle="Currently enrolled"
          />
        </Col>
        <Col xl={3} md={6}>
          <StatCard
            title="Total Classes"
            value={stats?.summary?.total_classes || 0}
            icon="bi-building"
            color="info"
            subtitle="Active classes"
          />
        </Col>
        <Col xl={3} md={6}>
          <StatCard
            title="New Admissions"
            value={stats?.recent_admissions?.total_last_7_days || 0}
            icon="bi-person-plus"
            color="warning"
            subtitle="Last 7 days"
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-3 mb-4">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Students by Class</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatClassData(stats?.students_by_class)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Gender Distribution</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formatGenderData(stats?.gender_distribution)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {formatGenderData(stats?.gender_distribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                {stats?.gender_distribution?.map((item, index) => (
                  <span key={item.gender} className="me-3">
                    <span
                      className="d-inline-block rounded-circle me-1"
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></span>
                    {item.gender}: {item.count}
                  </span>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Students Table */}
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Admissions</h6>
              <button 
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => navigate('/students')}
              >
                View All
              </button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Student</th>
                    <th>Admission No.</th>
                    <th>Class</th>
                    <th>Gender</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_students?.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle bg-primary text-white me-2">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span>{student.full_name}</span>
                        </div>
                      </td>
                      <td>{student.admission_number}</td>
                      <td>{student.class_name ? `${student.grade_level}-${student.class_name}` : 'Not Assigned'}</td>
                      <td>{student.gender}</td>
                      <td>
                        <Badge bg={student.status === 'Active' ? 'success' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        No recent admissions
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Monthly Admissions</h6>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.monthly_admissions || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={(value) => value.slice(-2)} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name, props) => [value, props.payload.month_name]}
                  />
                  <Bar dataKey="count" fill="#198754" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
