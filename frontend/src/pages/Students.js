import React, { useState, useEffect } from 'react';
import { 
  Row,
  Col,
  Table, 
  Button, 
  Form, 
  InputGroup, 
  Pagination, 
  Badge, 
  Card, 
  Spinner,
  Dropdown,
  Modal
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import classService from '../services/classService';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    class_id: '',
    status: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, searchTerm, filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      };
      
      const response = await studentService.getAll(params);
      if (response.success) {
        setStudents(response.data.students);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      if (response.success) {
        setClasses(response.data.classes);
      }
    } catch (error) {
      console.error('Failed to load classes');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    
    try {
      const response = await studentService.delete(studentToDelete.id);
      if (response.success) {
        toast.success('Student deleted successfully');
        fetchStudents();
      }
    } catch (error) {
      toast.error('Failed to delete student');
    } finally {
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Active': 'success',
      'Inactive': 'secondary',
      'Graduated': 'info',
      'Dropped': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getGenderIcon = (gender) => {
    if (gender === 'Male') return <i className="bi bi-gender-male text-primary"></i>;
    if (gender === 'Female') return <i className="bi bi-gender-female text-danger"></i>;
    return <i className="bi bi-gender-ambiguous text-secondary"></i>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Students</h4>
          <p className="text-muted mb-0">Manage student records</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/students/add')}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, admission no..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select 
                name="class_id" 
                value={filters.class_id}
                onChange={handleFilterChange}
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.grade_level} - {cls.section} ({cls.class_name})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                name="status" 
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Dropped">Dropped</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ class_id: '', status: '' });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <i className="bi bi-x-circle me-1"></i>
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Students Table */}
      <Card>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Student</th>
                  <th>Admission No.</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <Spinner animation="border" size="sm" />
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1"></i>
                      <p className="mt-2">No students found</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-circle bg-primary text-white me-2">
                            {student.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-medium">{student.full_name}</div>
                            <small className="text-muted">Adm: {student.admission_date}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-primary fw-medium">{student.admission_number}</span>
                      </td>
                      <td>
                        {student.class_name ? (
                          <Badge bg="light" text="dark">
                            {student.grade_level}-{student.section}
                          </Badge>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{getGenderIcon(student.gender)}</td>
                      <td>{student.email || '-'}</td>
                      <td>{student.phone || '-'}</td>
                      <td>{getStatusBadge(student.status)}</td>
                      <td className="text-end">
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm" className="border-0">
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => navigate(`/students/${student.id}`)}>
                              <i className="bi bi-eye me-2"></i>View
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate(`/students/edit/${student.id}`)}>
                              <i className="bi bi-pencil me-2"></i>Edit
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={() => handleDeleteClick(student)}
                            >
                              <i className="bi bi-trash me-2"></i>Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Card.Footer className="bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <Pagination size="sm" className="mb-0">
                <Pagination.First 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                />
                <Pagination.Prev 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                />
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === pagination.page}
                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                />
                <Pagination.Last 
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))}
                />
              </Pagination>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{studentToDelete?.full_name}</strong>?
          <p className="text-muted mt-2 mb-0">
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Students;
