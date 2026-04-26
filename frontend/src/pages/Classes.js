import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Form, 
  Badge, 
  Card, 
  Spinner,
  Dropdown,
  Modal,
  Row,
  Col
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import classService from '../services/classService';
import toast from 'react-hot-toast';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    class_name: '',
    grade_level: '',
    section: 'A',
    capacity: 30,
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = selectedYear ? { academic_year: selectedYear } : {};
      const response = await classService.getAll(params);
      if (response.success) {
        setClasses(response.data.classes);
        setAcademicYears(response.data.academic_years);
        
        // Set default selected year if not set
        if (!selectedYear && response.data.academic_years.length > 0) {
          setSelectedYear(response.data.academic_years[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      class_name: '',
      grade_level: '',
      section: 'A',
      capacity: 30,
      academic_year: selectedYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      is_active: true
    });
    setShowAddModal(true);
  };

  const handleEditClick = (cls) => {
    setSelectedClass(cls);
    setFormData({
      class_name: cls.class_name,
      grade_level: cls.grade_level,
      section: cls.section,
      capacity: cls.capacity,
      academic_year: cls.academic_year,
      is_active: cls.is_active
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (cls) => {
    setSelectedClass(cls);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (isEdit = false) => {
    setSaving(true);
    
    try {
      let response;
      if (isEdit) {
        response = await classService.update(selectedClass.id, formData);
      } else {
        response = await classService.create(formData);
      }
      
      if (response.success) {
        toast.success(isEdit ? 'Class updated successfully' : 'Class created successfully');
        fetchClasses();
        setShowAddModal(false);
        setShowEditModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save class');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await classService.delete(selectedClass.id);
      if (response.success) {
        toast.success('Class deleted successfully');
        fetchClasses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete class');
    } finally {
      setShowDeleteModal(false);
      setSelectedClass(null);
    }
  };

  const getCapacityBadge = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">Classes</h4>
          <p className="text-muted mb-0">Manage classes and grades</p>
        </div>
        <Button variant="primary" onClick={handleAddClick}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Class
        </Button>
      </div>

      {/* Academic Year Filter */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3}>
              <Form.Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Academic Years</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={9} className="text-end">
              <span className="text-muted">
                Showing {classes.length} classes
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Classes Table */}
      <Card>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Class Name</th>
                  <th>Grade Level</th>
                  <th>Section</th>
                  <th>Students</th>
                  <th>Capacity</th>
                  <th>Academic Year</th>
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
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1"></i>
                      <p className="mt-2">No classes found</p>
                    </td>
                  </tr>
                ) : (
                  classes.map((cls) => (
                    <tr key={cls.id}>
                      <td>
                        <div className="fw-medium">{cls.class_name}</div>
                      </td>
                      <td>{cls.grade_level}</td>
                      <td>{cls.section}</td>
                      <td>
                        <Badge bg={getCapacityBadge(cls.student_count, cls.capacity)}>
                          {cls.student_count} / {cls.capacity}
                        </Badge>
                      </td>
                      <td>{cls.capacity}</td>
                      <td>{cls.academic_year}</td>
                      <td>
                        <Badge bg={cls.is_active ? 'success' : 'secondary'}>
                          {cls.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm" className="border-0">
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => navigate(`/students?class_id=${cls.id}`)}>
                              <i className="bi bi-people me-2"></i>View Students
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditClick(cls)}>
                              <i className="bi bi-pencil me-2"></i>Edit
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item 
                              className="text-danger"
                              onClick={() => handleDeleteClick(cls)}
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
      </Card>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Class</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Class Name *</Form.Label>
              <Form.Control
                type="text"
                name="class_name"
                value={formData.class_name}
                onChange={handleFormChange}
                placeholder="e.g., Class 1-A"
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Grade Level *</Form.Label>
                  <Form.Control
                    type="text"
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleFormChange}
                    placeholder="e.g., 1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Section</Form.Label>
                  <Form.Control
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleFormChange}
                    placeholder="e.g., A"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Academic Year *</Form.Label>
                  <Form.Control
                    type="text"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleFormChange}
                    placeholder="e.g., 2024-2025"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Check
                type="switch"
                name="is_active"
                label="Active"
                checked={formData.is_active}
                onChange={handleFormChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Class</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Class Name *</Form.Label>
              <Form.Control
                type="text"
                name="class_name"
                value={formData.class_name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Grade Level *</Form.Label>
                  <Form.Control
                    type="text"
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Section</Form.Label>
                  <Form.Control
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Academic Year *</Form.Label>
                  <Form.Control
                    type="text"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group>
              <Form.Check
                type="switch"
                name="is_active"
                label="Active"
                checked={formData.is_active}
                onChange={handleFormChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Update'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{selectedClass?.class_name}</strong>?
          <p className="text-muted mt-2 mb-0">
            This class has {selectedClass?.student_count || 0} students enrolled.
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

export default Classes;
