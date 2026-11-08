const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function seed() {
    console.log('Connecting with user:', process.env.DB_USER, 'to host:', process.env.DB_HOST);
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT)
    });

    console.log('Connected to MySQL successfully.');

    try {
        await connection.beginTransaction();

        // 1. Insert Event
        console.log('1. Creating Project Expo event in events table...');
        const [eventRes] = await connection.query(`
            INSERT INTO events (
                EventName, Description, Highlights, Facilities, Requirements, TeamSize,
                StartDate, EndDate, RegistrationStart, RegistrationEnd, Location,
                AuditoriumVenue, EventType, EventStatus, RegistrationOpen, MaxCapacity, MaxAdmins,
                Posters, PrimaryColor, SecondaryColor, TertiaryColor
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?
            )
        `, [
            'InnovateX National Project Expo 2026',
            'Premier National Level Engineering & Innovation Project Expo showcasing live working prototypes, hardware demonstrations, and cutting-edge software solutions across AI, IoT, Autonomous Robotics, CleanTech, and Web3.',
            'Live Prototype Showcase, Industry Panel Evaluation, 15+ Tech Domains, ₹1,50,000 Prize Pool, Patent Advisory & Angel Incubation Opportunities',
            'Dedicated 230V AC Power Socket, High-Speed Wi-Fi (1 Gbps), Exhibition Demo Table & 2 Chairs, 3x2 ft Poster Standee, On-site Technical Helpdesk',
            'Working Hardware Prototype or Live Deployed Application, 3x2 ft Standee Poster, High-Resolution Architecture Slides, Public GitHub / Video Walkthrough',
            '1-4',
            '2026-11-20',
            '2026-11-21',
            '2026-11-01',
            '2026-11-18',
            'Innovation Campus Convention Center, Main Pavilion',
            'Hall A - Exhibition Arena',
            'Project Expo',
            'ongoing',
            1,
            50,
            5,
            'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
            '#10b981',
            '#059669',
            '#047857'
        ]);

        const eventId = eventRes.insertId;
        console.log(`Event created with ID: ${eventId}`);

        // 2. Assign Admins in event_admins
        console.log('2. Assigning Event Admins...');
        const adminUserIds = [24, 19, 1, 16]; // admin@gmail.com, bhargav@gmail.com, swathi@gmail.com, hacksprint@gmail.com
        for (const uId of adminUserIds) {
            await connection.query(`
                INSERT INTO event_admins (AdminId, EventId, Role, CreatedAt)
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE Role = VALUES(Role)
            `, [uId, eventId, 'Expo Lead Director']);
        }

        // 3. Project Expo Configuration
        console.log('3. Inserting Project Expo Config...');
        const depts = JSON.stringify(['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical', 'Bio-Medical']);
        const branches = JSON.stringify(['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'AIML', 'DS', 'IOT']);
        const years = JSON.stringify(['1st Year', '2nd Year', '3rd Year', '4th Year']);

        await connection.query(`
            INSERT INTO project_expo_configs (
                EventId, ParticipationType, MinTeamSize, MaxTeamSize,
                AllowedDepartments, AllowedBranches, AllowedYears,
                SubmissionDeadline, MaxSubmissions, TotalBooths, BoothPrefix,
                PresentationDurationMinutes, Guidelines, RequiredDocuments, Status
            ) VALUES (
                ?, 'Both', 1, 4,
                ?, ?, ?,
                '2026-11-19 23:59:59', 50, 20, 'STALL-',
                15,
                '1. Working prototype demonstration is mandatory for all exhibiting teams.\n2. Poster / Banner standee dimensions must strictly adhere to 3ft x 2ft.\n3. Prototype electrical insulation must comply with laboratory safety protocols.\n4. Teams must report to their assigned stall 30 minutes prior to jury rounds.\n5. 10 minutes live demonstration followed by 5 minutes jury Q&A defense.',
                'Project Abstract (PDF), System Architecture Diagram (PNG/PDF), Final Slide Deck (PPTX), Working Demo Video / Code Repository URL',
                'RESULTS_PUBLISHED'
            )
        `, [eventId, depts, branches, years]);

        // 4. Domains
        console.log('4. Seeding Domains...');
        const domainsData = [
            ['Artificial Intelligence & Machine Learning', 'Deep learning, computer vision, NLP, and predictive intelligence models.'],
            ['Internet of Things (IoT) & Smart Cities', 'Sensor networks, edge telemetry, automation, and smart infrastructure.'],
            ['Robotics & Autonomous Systems', 'Unmanned rovers, drones, robotic manipulators, and SLAM navigation.'],
            ['Web & Cloud Application Development', 'Scalable distributed systems, SaaS architectures, and cloud services.'],
            ['Healthcare & Bio-Medical Engineering', 'Patient monitoring, assistive devices, diagnostics, and BCI hardware.'],
            ['Clean Energy & Sustainable Tech', 'Solar tracking, smart grid balancing, water filtration, and waste reduction.'],
            ['Cybersecurity & Blockchain', 'Zero-trust networks, cryptanalysis, DeFi, and immutable supply chain systems.']
        ];

        const domainMap = {};
        for (let i = 0; i < domainsData.length; i++) {
            const [name, desc] = domainsData[i];
            const [dRes] = await connection.query(`
                INSERT INTO project_expo_domains (EventId, DomainName, Description, DisplayOrder)
                VALUES (?, ?, ?, ?)
            `, [eventId, name, desc, i + 1]);
            domainMap[name] = dRes.insertId;
        }

        // 5. Criteria
        console.log('5. Seeding Criteria...');
        const criteriaData = [
            ['Innovation & Uniqueness', 25, 1],
            ['Technical Complexity & Engineering', 25, 2],
            ['Working Prototype Demonstration', 25, 3],
            ['Real-World Impact & Feasibility', 15, 4],
            ['Presentation & Q&A Defense', 10, 5]
        ];

        const criteriaList = [];
        for (const [cName, marks, order] of criteriaData) {
            const [cRes] = await connection.query(`
                INSERT INTO project_expo_criteria (EventId, CriteriaName, MaxMarks, DisplayOrder)
                VALUES (?, ?, ?, ?)
            `, [eventId, cName, marks, order]);
            criteriaList.push({ id: cRes.insertId, name: cName, max: marks });
        }

        // 6. Evaluators
        console.log('6. Creating Judges / Evaluators for this Expo Event...');
        const judgeData = [
            {
                name: 'Dr. K. Suresh',
                email: 'suresh.eval@gmail.com',
                username: `suresh_eval_${eventId}`,
                track: 'Physical',
                college: 'AITAM',
                role: 'Chief Technical Jury - AI & Robotics'
            },
            {
                name: 'Prof. M. Priya',
                email: 'priya.eval@gmail.com',
                username: `priya_eval_${eventId}`,
                track: 'Physical',
                college: 'AITAM',
                role: 'Senior Jury - IoT & Sustainable Systems'
            },
            {
                name: 'Bhargav Naidu',
                email: 'bhargav.eval@gmail.com',
                username: `bhargav_eval_${eventId}`,
                track: 'Physical',
                college: 'AITAM',
                role: 'Industry Tech Architect & Venture Jury'
            }
        ];

        const judgeIds = [];
        for (const j of judgeData) {
            const [jRes] = await connection.query(`
                INSERT INTO evaluators (
                    EventId, Name, Email, Username, Password, PlainTextPassword,
                    Track, College, Role, EventRole, Status, RoleId, CreatedAt
                ) VALUES (
                    ?, ?, ?, ?, '$2b$10$SJilggZXLHJTG3YBkq6WaeQCmDlnLQkHdp4drfJyocRW/O4/FMCxa', 'Password@123',
                    ?, ?, ?, ?, 'Active', 4, NOW()
                )
            `, [eventId, j.name, j.email, j.username, j.track, j.college, j.role, j.role]);
            judgeIds.push(jRes.insertId);
        }

        // 7. Generate Booths
        console.log('7. Generating Exhibition Stalls / Booths...');
        const boothMap = {}; // index -> boothId
        for (let i = 1; i <= 20; i++) {
            const stallNo = `STALL-${i < 10 ? '0' + i : i}`;
            const [bRes] = await connection.query(`
                INSERT INTO project_expo_booths (EventId, BoothNumber, LocationZone, Status, Notes)
                VALUES (?, ?, ?, 'AVAILABLE', 'Equipped with 230V 5A socket and display table.')
            `, [eventId, stallNo, 'Main Innovation Pavilion']);
            boothMap[i] = { id: bRes.insertId, number: stallNo };
        }

        // 8. Define 10 Teams
        console.log('8. Creating 10 Teams with existing users, submissions, booth allocations, and presentation slots...');
        const teamsConfig = [
            {
                teamName: 'NeuralVision AI',
                leadUserId: 15, // bhargavanaidujaddu@gmail.com (Bhargav)
                members: [
                    { userId: 44, name: 'Test User 2', email: 'testuser2@test.com' },
                    { userId: 45, name: 'Test User 3', email: 'testuser3@test.com' }
                ],
                college: 'AITAM COLLEGE',
                state: 'Andhra Pradesh',
                techStack: 'PyTorch, TensorRT, FastAPI, React, Docker, CUDA',
                domainName: 'Artificial Intelligence & Machine Learning',
                projectTitle: 'NeuralVision: Real-Time Multimodal Brain Tumor Segmentation & Diagnostic Copilot',
                problemStatement: 'Manual radiological analysis of multi-sequence MRI brain scans requires 40-60 minutes per patient, leading to diagnostic delays in critical oncology units.',
                abstract: 'NeuralVision introduces an edge-accelerated 3D Convolutional + Swin Transformer neural network that automatically delineates whole tumor, active core, and enhancing regions in 4.2 seconds with a 98.4% Dice similarity score.',
                proposedSolution: 'A localized clinical workstation hardware bundle paired with an intuitive DICOM web viewer providing interactive volumetric 3D visualization and automated volumetric tumor change reporting.',
                technologiesUsed: 'Python 3.11, PyTorch 2.4, TensorRT, FastAPI, Three.js DICOM Viewer, Docker, CUDA 12',
                innovationUniqueness: 'Hybrid 3D Swin-UNETR architecture delivering sub-5-second inference directly on edge workstations without patient data leaving hospital perimeter.',
                realWorldApplications: 'Emergency neurosurgery planning, radiation oncology dosing optimization, and rural hospital diagnostic assistance.',
                githubRepoUrl: 'https://github.com/innovate-expo/neuralvision-ai',
                liveDemoUrl: 'https://neuralvision-ai.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/neuralvision_expo_final.pdf',
                documentationUrl: 'https://docs.neuralvision.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['10:00:00', '10:20:00'],
                baseScore: 95.5,
                winnerCategory: '1st Prize Champion',
                prizeAmount: '₹50,000 Cash + Gold Trophy + Incubation Grant'
            },
            {
                teamName: 'AgroSense IoT',
                leadUserId: 2, // saisakethbikkina@gmail.com (Lakshmi Sai Saketh Bikkina)
                members: [
                    { userId: 46, name: 'Test User 4', email: 'testuser4@test.com' },
                    { userId: 47, name: 'Test User 5', email: 'testuser5@test.com' }
                ],
                college: 'AITAM',
                state: 'Andhra Pradesh',
                techStack: 'ESP32, LoRaWAN, MQTT, Node.js, TimescaleDB, Flutter',
                domainName: 'Internet of Things (IoT) & Smart Cities',
                projectTitle: 'AgroSense: Solar-Powered LoRaWAN Precision Irrigation & Soil Health Mesh',
                problemStatement: 'Inefficient flood irrigation causes up to 60% agricultural water loss and accelerated soil nutrient leaching in semi-arid agrarian belts.',
                abstract: 'AgroSense is a low-power wireless telemetry mesh of autonomous soil sensors monitoring NPK, moisture, and temperature, driving smart solenoid valves that deliver precise micro-irrigation.',
                proposedSolution: 'Decentralized battery-free LoRaWAN nodes paired with an offline-first solar gateway running predictive evapotranspiration models to automate drip irrigation cycles.',
                technologiesUsed: 'ESP32-S3, LoRaWAN 868MHz, Capacitive NPK Sensors, TimescaleDB, MQTT, Flutter Mobile App',
                innovationUniqueness: 'Ultralow-power energy harvesting circuit operating indefinitely from ambient soil heat differential and small solar cells.',
                realWorldApplications: 'Commercial horticulture, water-scarce grain farming, and automated precision greenhouse management.',
                githubRepoUrl: 'https://github.com/innovate-expo/agrosense-iot',
                liveDemoUrl: 'https://agrosense.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/agrosense_deck.pdf',
                documentationUrl: 'https://docs.agrosense.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['10:25:00', '10:45:00'],
                baseScore: 92.2,
                winnerCategory: '1st Runner-Up',
                prizeAmount: '₹30,000 Cash + Silver Trophy'
            },
            {
                teamName: 'RoboRescue Bot',
                leadUserId: 36, // nagalaxmijada50@gmail.com (Padma)
                members: [
                    { userId: 48, name: 'Test User 6', email: 'testuser6@test.com' },
                    { userId: 49, name: 'Test User 7', email: 'testuser7@test.com' }
                ],
                college: 'GIET',
                state: 'Andhra Pradesh',
                techStack: 'ROS 2, LiDAR, Jetson Orin Nano, OpenCV, Python, C++',
                domainName: 'Robotics & Autonomous Systems',
                projectTitle: 'RoboRescue: Autonomous Disaster Response All-Terrain Tracked Search Rover',
                problemStatement: 'Search and rescue operations in collapsed earthquake zones and industrial fires hazard human responders due to toxic gases and structural instability.',
                abstract: 'RoboRescue is a reinforced flipper-tracked rover equipped with 3D LiDAR SLAM, dual FLIR thermal vision, and CO2/VOC sniffers to detect trapped human survivors in zero-visibility disaster sites.',
                proposedSolution: 'Combines autonomous frontier exploration with real-time audio-visual two-way relay, enabling operators to converse with survivors through subterranean rubble.',
                technologiesUsed: 'ROS 2 Humble, NVIDIA Jetson Orin Nano, RPLiDAR A3, FLIR Lepton 3.5, C++, WebRTC',
                innovationUniqueness: 'Continuous track flipper geometry overcoming 45-degree rubble debris with zero human intervention.',
                realWorldApplications: 'National Disaster Response Forces (NDRF), municipal fire brigades, and deep mining tunnel rescue.',
                githubRepoUrl: 'https://github.com/innovate-expo/robo-rescue-bot',
                liveDemoUrl: 'https://roborescue.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/roborescue_expo.pdf',
                documentationUrl: 'https://docs.roborescue.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['10:50:00', '11:10:00'],
                baseScore: 89.8,
                winnerCategory: '2nd Runner-Up',
                prizeAmount: '₹20,000 Cash + Bronze Trophy'
            },
            {
                teamName: 'NeuroPro BCI',
                leadUserId: 5, // testuser@gmail.com (Test User)
                members: [
                    { userId: 60, name: 'Test User 18', email: 'testuser18@test.com' },
                    { userId: 61, name: 'Test User 19', email: 'testuser19@test.com' }
                ],
                college: 'MIT',
                state: 'California',
                techStack: 'OpenBCI, BrainFlow, SciPy, Flutter, C++, Bluetooth BLE',
                domainName: 'Healthcare & Bio-Medical Engineering',
                projectTitle: 'NeuroPro: Non-Invasive EEG Brain-Computer Interface Powered Mobility Wheelchair',
                problemStatement: 'Quadriplegic patients and ALS sufferers lack motor control to navigate standard joysticks or chin controllers, resulting in total loss of autonomous mobility.',
                abstract: 'NeuroPro translates steady-state visual evoked potentials (SSVEP) and motor imagery EEG signals from an 8-channel dry electrode headset into proportional motorized wheelchair steering commands.',
                proposedSolution: 'An active noise-cancelling signal acquisition headband combined with a low-latency digital signal processor executing fast Fourier transforms (FFT) on device.',
                technologiesUsed: 'OpenBCI Cyton, BrainFlow DSP Library, Flutter, Raspberry Pi 5, Python 3.12, BLE 5.2',
                innovationUniqueness: 'Ultra-low calibration time under 90 seconds utilizing adaptive Riemannian geometry classification.',
                realWorldApplications: 'Rehabilitation clinics, ALS patient mobility, and advanced neurological research facilities.',
                githubRepoUrl: 'https://github.com/innovate-expo/neuropro-bci',
                liveDemoUrl: 'https://neuropro.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/neuropro_bci.pdf',
                documentationUrl: 'https://docs.neuropro.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['11:15:00', '11:35:00'],
                baseScore: 88.0,
                winnerCategory: 'Most Innovative Research Award',
                prizeAmount: '₹10,000 Cash + Special Innovation Citation'
            },
            {
                teamName: 'AquaPure CleanTech',
                leadUserId: 13, // sai@gmail.com (Sai)
                members: [
                    { userId: 50, name: 'Test User 8', email: 'testuser8@test.com' },
                    { userId: 51, name: 'Test User 9', email: 'testuser9@test.com' }
                ],
                college: 'AITAM',
                state: 'AP',
                techStack: 'Arduino, Turbidity Sensors, Bio-Ceramic Filters, React Dashboard',
                domainName: 'Clean Energy & Sustainable Tech',
                projectTitle: 'AquaPure: Autonomous Solar River Waste Skimmer & Microplastic Trapper',
                problemStatement: 'Accumulation of non-biodegradable macroplastics and hazardous microfibers in river waterways pollutes downstream drinking supplies and devastates aquatic ecosystems.',
                abstract: 'AquaPure is a catamaran surface vessel powered by dual solar panels, utilizing conveyor entrapment and mechanical filtration stages to extract 50kg of floating debris daily.',
                proposedSolution: 'Autonomous GPS waypoint patrol routing combined with multi-parameter water telemetry (pH, Dissolved Oxygen, Turbidity, TDS) mapped onto a public live dashboard.',
                technologiesUsed: 'Dual Polycrystalline Solar, Arduino Mega, Optical Turbidity Sensors, 4G LTE IoT Gateway, React, Leaflet Maps',
                innovationUniqueness: 'Bio-ceramic filtration cascade trapping microplastics down to 20 micrometers while generating its own operational propulsion power.',
                realWorldApplications: 'Municipal river cleaning, reservoir maintenance, and commercial harbor trash mitigation.',
                githubRepoUrl: 'https://github.com/innovate-expo/aquapure-cleantech',
                liveDemoUrl: 'https://aquapure.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/aquapure_final.pdf',
                documentationUrl: 'https://docs.aquapure.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['11:40:00', '12:00:00'],
                baseScore: 86.4,
                winnerCategory: 'Best Environmental Impact Award',
                prizeAmount: '₹10,000 Cash + Sustainability Citation'
            },
            {
                teamName: 'AeroDrone Inspector',
                leadUserId: 14, // sanju@gmail.com (Sanju)
                members: [
                    { userId: 52, name: 'Test User 10', email: 'testuser10@test.com' },
                    { userId: 53, name: 'Test User 11', email: 'testuser11@test.com' }
                ],
                college: 'AITAM',
                state: 'AP',
                techStack: 'Pixhawk 6X, YOLOv8, Raspberry Pi 5, Python, Next.js',
                domainName: 'Robotics & Autonomous Systems',
                projectTitle: 'AeroDrone: AI Autonomous Bridge & Concrete Crack Inspection Drone',
                problemStatement: 'Physical inspection of high-elevation bridges, dams, and wind turbines puts civil engineers at severe physical risk and requires exorbitant scaffolding costs.',
                abstract: 'AeroDrone is a heavy-lift carbon-fiber hexacopter equipped with ultrasonic distance keeping and a 48MP gimbal camera executing on-the-fly YOLOv8 visual crack segmentation.',
                proposedSolution: 'Automated photogrammetry flight path planning generating sub-millimeter 3D digital twins with classified structural defect heatmaps.',
                technologiesUsed: 'Pixhawk 6X Flight Controller, Raspberry Pi 5 Companion Computer, YOLOv8 TensorRT, OpenCV, ArduPilot',
                innovationUniqueness: 'Laser-rangefinder assisted wall hugging preventing GPS-denied aerodynamic drift under massive concrete overpasses.',
                realWorldApplications: 'Highway authority bridge safety audits, wind farm blade maintenance, and railway viaduct diagnostics.',
                githubRepoUrl: 'https://github.com/innovate-expo/aerodrone-inspector',
                liveDemoUrl: 'https://aerodrone.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/aerodrone_deck.pdf',
                documentationUrl: 'https://docs.aerodrone.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['12:05:00', '12:25:00'],
                baseScore: 85.0,
                winnerCategory: 'Best Hardware Engineering Award',
                prizeAmount: '₹10,000 Cash + Engineering Excellence Trophy'
            },
            {
                teamName: 'MediChain Guard',
                leadUserId: 40, // 24a51a0575@adityatekkali.edu.in (Sruthi)
                members: [
                    { userId: 54, name: 'Test User 12', email: 'testuser12@test.com' },
                    { userId: 55, name: 'Test User 13', email: 'testuser13@test.com' }
                ],
                college: 'AITAM',
                state: 'AP',
                techStack: 'Solidity, Ethereum, IPFS, Polygon, React Native, Node.js',
                domainName: 'Cybersecurity & Blockchain',
                projectTitle: 'MediChain: Tamper-Evident Pharma Cold-Chain & Anti-Counterfeit Verification',
                problemStatement: 'World Health Organization estimates over 10% of medications in developing markets are counterfeit or spoiled through cold-chain temperature deviations.',
                abstract: 'MediChain embeds tamper-evident NFC tags onto pharmaceutical cartons, registering immutable cryptographic handshakes and temperature logs on Polygon zkEVM at every shipping leg.',
                proposedSolution: 'Patients scan medicine packaging with any smartphone to instantly verify pharmaceutical provenance, lab test certificates, and continuous storage thermal compliance.',
                technologiesUsed: 'Solidity, Polygon zkEVM, Hardhat, IPFS, Web3.js, React Native, NXP NTAG 424 DNA',
                innovationUniqueness: 'Zero-knowledge proofs guaranteeing pharmaceutical supply chain integrity without exposing sensitive manufacturer pricing or volume details.',
                realWorldApplications: 'Global vaccine cold-chain monitoring, oncology drug verification, and hospital pharmacy inventory authentication.',
                githubRepoUrl: 'https://github.com/innovate-expo/medichain-guard',
                liveDemoUrl: 'https://medichain.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/medichain_deck.pdf',
                documentationUrl: 'https://docs.medichain.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['13:00:00', '13:20:00'],
                baseScore: 83.2,
                winnerCategory: 'High Commendation - Cyber & Web3',
                prizeAmount: 'Certificate of Excellence'
            },
            {
                teamName: 'SmartGrid Optimizer',
                leadUserId: 41, // baratamdedeepya3@gmail.com (B.Dedeepya)
                members: [
                    { userId: 56, name: 'Test User 14', email: 'testuser14@test.com' },
                    { userId: 57, name: 'Test User 15', email: 'testuser15@test.com' }
                ],
                college: 'AITAM',
                state: 'Ap',
                techStack: 'Python, LSTM, Scada Simulator, InfluxDB, Grafana, Raspberry Pi',
                domainName: 'Clean Energy & Sustainable Tech',
                projectTitle: 'SmartGrid: Predictive AI Microgrid Load Balancing & Solar Peak Shaving',
                problemStatement: 'Unpredictable renewable generation surges destabilize localized university campus microgrids and trigger heavy utility penalty tariffs.',
                abstract: 'SmartGrid uses an LSTM recurrent network to forecast campus electrical load 4 hours in advance, orchestrating battery storage charging and non-critical circuit shedding.',
                proposedSolution: 'A hardware demonstration bench with simulated solar arrays, solid-state bi-directional relays, and real-time power factor correction.',
                technologiesUsed: 'Python 3.11, PyTorch, InfluxDB, Grafana Dashboard, Modbus TCP/IP, Raspberry Pi 4B',
                innovationUniqueness: 'Sub-second dynamic tariff arbitrage routing surplus solar energy into local storage during peak grid fee intervals.',
                realWorldApplications: 'University campuses, corporate tech parks, and commercial solar microgrids.',
                githubRepoUrl: 'https://github.com/innovate-expo/smartgrid-optimizer',
                liveDemoUrl: 'https://smartgrid.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/smartgrid_expo.pdf',
                documentationUrl: 'https://docs.smartgrid.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['13:25:00', '13:45:00'],
                baseScore: 81.5,
                winnerCategory: 'High Commendation - Clean Energy',
                prizeAmount: 'Certificate of Excellence'
            },
            {
                teamName: 'CyberSentinel Shield',
                leadUserId: 42, // hemanthvavilapalli25@gmail.com (V.Hemanth)
                members: [
                    { userId: 58, name: 'Test User 16', email: 'testuser16@test.com' },
                    { userId: 59, name: 'Test User 17', email: 'testuser17@test.com' }
                ],
                college: 'AITAM',
                state: 'Ap',
                techStack: 'eBPF, Go, PyTorch, Suricata, Kafka, Next.js',
                domainName: 'Cybersecurity & Blockchain',
                projectTitle: 'CyberSentinel: eBPF-Powered Zero-Trust Cloud Workload Anomaly Detection',
                problemStatement: 'Traditional user-space antivirus and container security agents impose heavy CPU overhead and fail to detect kernel-level memory escalation exploits.',
                abstract: 'CyberSentinel hooks directly into Linux kernel tracepoints via eBPF bytecode, inspecting system calls and container socket activity with less than 0.8% overhead.',
                proposedSolution: 'A lightweight Go daemon streaming kernel telemetry to an autoencoder neural model detecting unauthorized binary injections and privilege escalations in real time.',
                technologiesUsed: 'Extended Berkeley Packet Filter (eBPF), Go 1.22, Cilium library, Kafka, ClickHouse, Next.js',
                innovationUniqueness: 'In-kernel packet dropping and container cgroup freezing before payload execution completes.',
                realWorldApplications: 'Kubernetes cluster security, cloud-native financial services, and critical infrastructure servers.',
                githubRepoUrl: 'https://github.com/innovate-expo/cybersentinel-shield',
                liveDemoUrl: 'https://cybersentinel.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/cybersentinel_expo.pdf',
                documentationUrl: 'https://docs.cybersentinel.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['13:50:00', '14:10:00'],
                baseScore: 80.0,
                winnerCategory: 'Honorable Mention',
                prizeAmount: 'Certificate of Merit'
            },
            {
                teamName: 'EcoCharge Station',
                leadUserId: 43, // testuser1@test.com (Test User 1)
                members: [
                    { userId: 62, name: 'Test User 20', email: 'testuser20@test.com' },
                    { userId: 17, name: 'Test User', email: 'testuser2026@gmail.com' }
                ],
                college: 'Test College 1',
                state: 'Test State',
                techStack: 'OCPP 2.0.1, React, Node.js, PostgreSQL, Docker',
                domainName: 'Web & Cloud Application Development',
                projectTitle: 'EcoCharge: Open-Protocol Distributed EV Charger Scheduling & Load Harmonization',
                problemStatement: 'Uncoordinated simultaneous electric vehicle charging at residential hubs threatens neighborhood substation transformers with severe brownouts.',
                abstract: 'EcoCharge implements the OCPP 2.0.1 standard to intelligently throttle and schedule EV charging sessions based on transformer headroom and user commute deadlines.',
                proposedSolution: 'A responsive full-stack cloud portal allowing charger hosts and drivers to reserve slots, monitor telemetry, and share charging capacity.',
                technologiesUsed: 'Node.js, WebSocket OCPP Gateway, React 18, Tailwind CSS, PostgreSQL, Docker Compose',
                innovationUniqueness: 'Dynamic multi-vehicle current ramping algorithm preventing peak demand spike surcharges for charging station operators.',
                realWorldApplications: 'Apartment complex EV charging bays, corporate fleets, and municipal curbside charging poles.',
                githubRepoUrl: 'https://github.com/innovate-expo/ecocharge-hub',
                liveDemoUrl: 'https://ecocharge.preview.ems.io',
                pptUrl: 'https://storage.ems.io/decks/ecocharge_deck.pdf',
                documentationUrl: 'https://docs.ecocharge.ems.io',
                mediaUrls: JSON.stringify([
                    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80'
                ]),
                slotTime: ['14:15:00', '14:35:00'],
                baseScore: 78.8,
                winnerCategory: 'Honorable Mention',
                prizeAmount: 'Certificate of Merit'
            }
        ];

        const createdTeamIds = [];
        const rankingsList = [];

        for (let i = 0; i < teamsConfig.length; i++) {
            const tc = teamsConfig[i];
            const stallIndex = i + 1;
            const stall = boothMap[stallIndex];
            const domainId = domainMap[tc.domainName] || null;

            // A. Insert registered_teams
            const [tRes] = await connection.query(`
                INSERT INTO registered_teams (
                    TeamName, TeamSize, College, State, Tech_Stack, EventId,
                    TeamLeadUserId, CreatedAt, GateCheckInStatus, GateCheckInTime
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, NOW(), 'CHECKED_IN', NOW()
                )
            `, [tc.teamName, String(tc.members.length + 1), tc.college, tc.state, tc.techStack, eventId, tc.leadUserId]);

            const teamId = tRes.insertId;
            createdTeamIds.push(teamId);

            // B. Insert registered_team_members (Leader + members)
            const [leadUser] = await connection.query(`SELECT UserName, Email, College, State FROM users WHERE Id = ?`, [tc.leadUserId]);
            const leadInfo = leadUser[0] || { UserName: 'Team Leader', Email: '', College: tc.college, State: tc.state };

            await connection.query(`
                INSERT INTO registered_team_members (
                    TeamId, UserId, Role, MemberName, MemberEmail, MemberCollege, MemberState, CreatedAt
                ) VALUES (
                    ?, ?, 'Team Leader', ?, ?, ?, ?, NOW()
                )
            `, [teamId, tc.leadUserId, leadInfo.UserName, leadInfo.Email, leadInfo.College || tc.college, leadInfo.State || tc.state]);

            for (const m of tc.members) {
                await connection.query(`
                    INSERT INTO registered_team_members (
                        TeamId, UserId, Role, MemberName, MemberEmail, MemberCollege, MemberState, CreatedAt
                    ) VALUES (
                        ?, ?, 'Core Member', ?, ?, ?, ?, NOW()
                    )
                `, [teamId, m.userId, m.name, m.email, tc.college, tc.state]);
            }

            // C. Insert event_registrations
            await connection.query(`
                INSERT INTO event_registrations (
                    EventId, TeamId, ParticipationMode, Status, CreatedAt, UpdatedAt
                ) VALUES (
                    ?, ?, 'Physical', 'Confirmed', NOW(), NOW()
                )
            `, [eventId, teamId]);

            // D. Insert project_expo_submissions (Approved)
            await connection.query(`
                INSERT INTO project_expo_submissions (
                    EventId, TeamId, DomainId, ProjectTitle, ProblemStatement,
                    Abstract, ProposedSolution, TechnologiesUsed, InnovationUniqueness,
                    RealWorldApplications, GithubRepoUrl, LiveDemoUrl, PptUrl,
                    DocumentationUrl, MediaUrls, Status, AdminFeedback, SubmittedByUserId,
                    SubmittedAt
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, 'APPROVED', 'Verified by Technical Review Board. Meets all exhibition guidelines and working prototype requirements.', ?,
                    NOW()
                )
            `, [
                eventId, teamId, domainId, tc.projectTitle, tc.problemStatement,
                tc.abstract, tc.proposedSolution, tc.technologiesUsed, tc.innovationUniqueness,
                tc.realWorldApplications, tc.githubRepoUrl, tc.liveDemoUrl, tc.pptUrl,
                tc.documentationUrl, tc.mediaUrls, tc.leadUserId
            ]);

            // E. Allocate Booth
            await connection.query(`
                UPDATE project_expo_booths
                SET AllocatedTeamId = ?, Status = 'ALLOCATED', AllocatedAt = NOW()
                WHERE Id = ?
            `, [teamId, stall.id]);

            // F. Schedule Presentation Slot
            await connection.query(`
                INSERT INTO project_expo_schedules (
                    EventId, TeamId, SlotDate, StartTime, EndTime, RoomOrBooth, JudgeId, Status
                ) VALUES (
                    ?, ?, '2026-11-20', ?, ?, ?, ?, 'COMPLETED'
                )
            `, [eventId, teamId, tc.slotTime[0], tc.slotTime[1], stall.number, judgeIds[0]]);

            // G. Submit Evaluations / Scores from all 3 Judges
            let teamTotalAccumulated = 0;
            for (let jIdx = 0; jIdx < judgeIds.length; jIdx++) {
                const jId = judgeIds[jIdx];
                const judgeDelta = (jIdx === 0 ? 0.5 : jIdx === 1 ? -0.5 : 0.0);
                const effectiveBase = Math.min(100, Math.max(50, tc.baseScore + judgeDelta));

                for (const crit of criteriaList) {
                    const ratio = effectiveBase / 100;
                    const mark = parseFloat((crit.max * ratio).toFixed(1));
                    teamTotalAccumulated += mark;

                    const feedbackComments = [
                        `Outstanding depth in ${crit.name.toLowerCase()}. Prototype ran flawlessly under live test conditions.`,
                        `Very solid execution and architecture. Impressive defense during jury cross-examination.`,
                        `Commendable prototype engineering with clear commercial and clinical viability.`
                    ];

                    await connection.query(`
                        INSERT INTO project_expo_scores (
                            EventId, TeamId, JudgeId, CriteriaId, Score, Feedback, CreatedAt
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, NOW()
                        )
                        ON DUPLICATE KEY UPDATE
                        Score = VALUES(Score),
                        Feedback = VALUES(Feedback)
                    `, [eventId, teamId, jId, crit.id, mark, feedbackComments[jIdx]]);
                }
            }

            const teamAvgScore = parseFloat((teamTotalAccumulated / judgeIds.length).toFixed(1));
            rankingsList.push({
                teamId,
                teamName: tc.teamName,
                projectTitle: tc.projectTitle,
                totalScore: teamAvgScore,
                category: tc.winnerCategory,
                prize: tc.prizeAmount
            });

            console.log(`Team ${i + 1}/10: "${tc.teamName}" created, allocated to ${stall.number}, evaluated with avg score ${teamAvgScore}!`);
        }

        // 9. Publish Results
        console.log('9. Publishing Project Expo Results and Rankings...');
        rankingsList.sort((a, b) => b.totalScore - a.totalScore);

        for (let rIdx = 0; rIdx < rankingsList.length; rIdx++) {
            const item = rankingsList[rIdx];
            await connection.query(`
                INSERT INTO project_expo_results (
                    EventId, TeamId, Category, RankPosition, TotalScore, PrizeAmount, IsPublished, PublishedAt
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, 1, NOW()
                )
            `, [eventId, item.teamId, item.category, rIdx + 1, item.totalScore, item.prize]);
        }

        await connection.commit();
        console.log('\n======================================================');
        console.log('DEMO PROJECT EXPO SEEDING COMPLETED SUCCESSFULLY!');
        console.log(`Event ID: ${eventId}`);
        console.log(`Event Name: InnovateX National Project Expo 2026`);
        console.log(`Teams Created: 10 (all with full submissions, stall allocations, presentation slots, evaluations, and published awards)`);
        console.log(`Evaluator Logins (Password: Password@123):`);
        judgeData.forEach((j) => {
            console.log(`- ${j.name} (${j.role}): Username: ${j.username} | Email: ${j.email}`);
        });
        console.log('======================================================');

        await connection.end();
        process.exit(0);
    } catch (err) {
        await connection.rollback();
        console.error('Seeding transaction rolled back due to error:', err);
        await connection.end();
        process.exit(1);
    }
}

seed();

