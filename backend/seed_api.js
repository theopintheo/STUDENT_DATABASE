const http = require('http');

const courses = [
    {
        name: 'Fullstack AI & ML',
        courseCode: 'FSD-AI-ML',
        description: 'Comprehensive program covering Full Stack Development integrated with AI and Machine Learning modules.',
        fees: { total: 75000 },
        duration: { value: 8, unit: 'months' }
    },
    {
        name: 'DevOps Engineering',
        courseCode: 'DEVOPS-001',
        description: 'Master CI/CD pipelines, containerization with Docker & Kubernetes, and cloud infrastructure.',
        fees: { total: 55000 },
        duration: { value: 4, unit: 'months' }
    },
    {
        name: 'Cyber Security',
        courseCode: 'CYBER-SEC',
        description: 'Learn ethical hacking, network security, and cryptography to secure digital assets.',
        fees: { total: 65000 },
        duration: { value: 6, unit: 'months' }
    },
    {
        name: 'Python Summer Coding',
        courseCode: 'PY-SUMMER',
        description: 'Intensive summer boot camp for Python programming fundamentals and project building.',
        fees: { total: 15000 },
        duration: { value: 2, unit: 'months' }
    },
    {
        name: 'Data Science',
        courseCode: 'DS-PRO',
        description: 'Advanced data analysis, visualization, and predictive modeling using Python and R.',
        fees: { total: 70000 },
        duration: { value: 6, unit: 'months' }
    },
    {
        name: 'Digital Marketing',
        courseCode: 'DIG-MKT',
        description: 'Master SEO, SEM, content marketing, and social media strategies to grow businesses online.',
        fees: { total: 45000 },
        duration: { value: 3, unit: 'months' }
    }
];

const postCourse = (courseData) => {
    const data = JSON.stringify(courseData);
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/courses',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log(`Status: ${res.statusCode} for ${courseData.name}`);
            if (res.statusCode >= 400) {
                console.log(`Response: ${responseBody}`);
            }
        });
    });

    req.on('error', (error) => {
        console.error(`Error for ${courseData.name}:`, error);
    });

    req.write(data);
    req.end();
};

console.log('Starting seed via API...');
let delay = 0;
courses.forEach(course => {
    setTimeout(() => {
        postCourse(course);
    }, delay);
    delay += 500; // Stagger requests slightly
});
