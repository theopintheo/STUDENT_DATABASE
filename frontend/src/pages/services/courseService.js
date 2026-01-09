// src/services/courseService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class CourseService {
  // Get all courses
  static async getAllCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data; // Returns {success: true, data: [...]} or just the array
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  // Get single course by ID
  static async getCourseById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  }

  // Create new course
  static async createCourse(courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Update course
  static async updateCourse(id, courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating course ${id}:`, error);
      throw error;
    }
  }

  // Delete course
  static async deleteCourse(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      throw error;
    }
  }

  // Search courses
  static async searchCourses(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  // Get courses by category
  static async getCoursesByCategory(categoryId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/category/${categoryId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching courses for category ${categoryId}:`, error);
      throw error;
    }
  }
}

export default CourseService;