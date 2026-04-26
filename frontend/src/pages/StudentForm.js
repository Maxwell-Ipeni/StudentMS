import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Button, 
  Card, 
  Row, 
  Col, 
  Spinner,
  Alert
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import classService from '../services/classService';
import toast from 'react-hot-toast';

const StudentForm = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    admission_number: '',
    full_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    address: '',
    class_id: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    notes: ''
  });

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isAddMode = mode === 'add';

  useEffect(() => {
    fetchClasses();
    
    if (isEditMode || isViewMode) {
      fetchStudent();
    }
  }, [id]);

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

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await studentService.getById(id);
      if (response.success) {
        const student = response.data;
        setFormData({
          admission_number: student.admission_number || '',
          full_name: student.full_name || '',
          email: student.email || '',
          phone: student.phone || '',
          gender: student.gender || 'Male',
          date_of_birth: student.date_of_birth || '',
          address: student.address || '',
          class_id: student.class_id || '',
          guardian_name: student.guardian_name || '',
          guardian_phone: student.guardian_phone || '',
          guardian_email: student.guardian_email || '',
          admission_date: student.admission_date || new Date().toISOString().split('T')[0],
          status: student.status || 'Active',
          notes: student.notes || ''
        });
      }
    } catch (error) {
      setError('Failed to load student data');
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.admission_number.trim() || !formData.full_name.trim()) {
      setError('Admission number and full name are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let response;
      
      if (isAddMode) {
        response = await studentService.create(formData);
      } else {
        response = await studentService.update(id, formData);
      }

      if (response.success) {
        toast.success(isAddMode ? 'Student created successfully' : 'Student updated successfully');
        navigate('/students');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save student');
      toast.error(error.response?.data?.message || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

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
        <div>
          <h4 className="mb-0">
            {isViewMode ? 'Student Details' : isEditMode ? 'Edit Student' : 'Add New Student'}
          </h4>
          <p className="text-muted mb-0">
            {isViewMode ? 'View student information' : isEditMode ? 'Update student information' : 'Create a new student record'}
          </p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate('/students')}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Students
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header className="bg-white">
            <h6 className="mb-0">Basic Information</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Admission Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="admission_number"
                    value={formData.admission_number}
                    onChange={handleChange}
                    placeholder="e.g., ADM2024001"
                    required
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isViewMode}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Admission Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="admission_date"
                    value={formData.admission_date}
                    onChange={handleChange}
                    required
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@email.com"
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Class</Form.Label>
                  <Form.Select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    disabled={isViewMode}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.grade_level} - {cls.section} ({cls.class_name})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isViewMode}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Dropped">Dropped</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                disabled={isViewMode}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="bg-white">
            <h6 className="mb-0">Guardian Information</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guardian Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardian_name"
                    value={formData.guardian_name}
                    onChange={handleChange}
                    placeholder="Guardian name"
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guardian Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="guardian_phone"
                    value={formData.guardian_phone}
                    onChange={handleChange}
                    placeholder="Guardian phone number"
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Guardian Email</Form.Label>
              <Form.Control
                type="email"
                name="guardian_email"
                value={formData.guardian_email}
                onChange={handleChange}
                placeholder="guardian@email.com"
                disabled={isViewMode}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header className="bg-white">
            <h6 className="mb-0">Additional Notes</h6>
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes or comments..."
                disabled={isViewMode}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {!isViewMode && (
          <div className="d-flex gap-2">
            <Button 
              variant="primary" 
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  {isAddMode ? 'Create Student' : 'Update Student'}
                </>
              )}
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/students')}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
};

export default StudentForm;
