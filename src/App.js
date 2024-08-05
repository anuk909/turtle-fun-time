import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  List,
  ListItem,
  Container,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TurtleEvents from './components/TurtleEvents';
import VirtualTurtleHabitat from './components/VirtualTurtleHabitat';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Auth Component
function Auth({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://react-app-3nh3s87e.devinapps.com/login', { username, password });
      if (response.data.success) {
        onLogin(username, response.data.userId);
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await axios.post('https://react-app-3nh3s87e.devinapps.com/register', { username, password, email });
      if (response.data.id) {
        toast({
          title: "Registration successful",
          description: "You can now log in with your credentials",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTabIndex(0); // Switch to login tab
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
      <TabList>
        <Tab>Login</Tab>
        <Tab>Register</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <form onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <Button type="submit" colorScheme="blue" width="full">
                Login
              </Button>
            </VStack>
          </form>
        </TabPanel>
        <TabPanel>
          <form onSubmit={handleRegister}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormControl>
              <Button type="submit" colorScheme="green" width="full">
                Register
              </Button>
            </VStack>
          </form>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

// Event Component
function Event({ event, onUpdateEvent }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdateEvent(editedEvent);
    setIsEditing(false);
  };

  return (
    <ListItem p={4} bg="gray.100" borderRadius="md">
      {isEditing ? (
        <VStack spacing={2}>
          <Input
            value={editedEvent.name}
            onChange={(e) => setEditedEvent({ ...editedEvent, name: e.target.value })}
          />
          <Input
            type="datetime-local"
            value={editedEvent.date}
            onChange={(e) => setEditedEvent({ ...editedEvent, date: e.target.value })}
          />
          <Button onClick={handleSave} colorScheme="green">Save</Button>
        </VStack>
      ) : (
        <VStack align="start">
          <Text fontWeight="bold">{event.name}</Text>
          <Text>{new Date(event.date).toLocaleString()}</Text>
          <Button onClick={handleEdit} size="sm">Edit</Button>
        </VStack>
      )}
    </ListItem>
  );
}

// Dashboard Component
function Dashboard({ username, userId }) {
  const [events, setEvents] = useState([]);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`https://react-app-3nh3s87e.devinapps.com/events/${userId}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error fetching events",
        description: "Unable to load your events. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (newEventName && newEventDate) {
      try {
        await axios.post('https://react-app-3nh3s87e.devinapps.com/events', { name: newEventName, date: newEventDate, creatorId: userId });
        fetchEvents();
        setNewEventName('');
        setNewEventDate('');
        toast({
          title: "Event created",
          description: `${newEventName} has been added to your events`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Event creation failed",
          description: error.response?.data?.message || "An error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Event creation failed",
        description: "Please enter both event name and date",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateEvent = async (updatedEvent) => {
    try {
      await axios.put(`https://react-app-3nh3s87e.devinapps.com/events/${updatedEvent.id}`, updatedEvent);
      fetchEvents();
      toast({
        title: "Event updated",
        description: `${updatedEvent.name} has been updated`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Event update failed",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, { sender: username, text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <Tabs>
      <TabList>
        <Tab>Events</Tab>
        <Tab>Profile</Tab>
        <Tab>Chat</Tab>
        <Tab>Analytics</Tab>
        <Tab><Link to="/turtle-events">Turtle Events</Link></Tab>
        <Tab><Link to="/virtual-turtle-habitat">Virtual Turtle Habitat</Link></Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <VStack spacing={6} align="stretch">
            <Heading as="h2" size="xl">
              Welcome, {username}!
            </Heading>
            <Box>
              <form onSubmit={handleCreateEvent}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>New Event Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Enter event name"
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Event Date</FormLabel>
                    <Input
                      type="datetime-local"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                    />
                  </FormControl>
                  <Button type="submit" colorScheme="green" width="full">
                    Create Event
                  </Button>
                </VStack>
              </form>
            </Box>
            <Box>
              <Heading as="h3" size="lg" mb={2}>
                Your Events:
              </Heading>
              <List spacing={3}>
                {events.map((event) => (
                  <Event key={event.id} event={event} onUpdateEvent={handleUpdateEvent} />
                ))}
              </List>
            </Box>
          </VStack>
        </TabPanel>

        <TabPanel>
          <VStack spacing={4} align="start">
            <Heading as="h3" size="lg">User Profile</Heading>
            <Avatar size="2xl" name={username} src="https://bit.ly/broken-link" />
            <Button onClick={onOpen}>Upload Avatar</Button>
            <Text>Username: {username}</Text>
            <Text>User ID: {userId}</Text>
          </VStack>
        </TabPanel>

        <TabPanel>
          <VStack spacing={4} align="stretch">
            <Heading as="h3" size="lg">Chat</Heading>
            <Box height="300px" overflowY="scroll" border="1px" borderColor="gray.200" p={2}>
              {chatMessages.map((msg, index) => (
                <Text key={index}><strong>{msg.sender}:</strong> {msg.text}</Text>
              ))}
            </Box>
            <FormControl>
              <Input
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </FormControl>
            <Button onClick={handleSendMessage} colorScheme="blue">Send</Button>
          </VStack>
        </TabPanel>

        <TabPanel>
          <VStack spacing={4} align="stretch">
            <Heading as="h3" size="lg">Analytics</Heading>
            <Box>
              <Line
                data={{
                  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                  datasets: [
                    {
                      label: 'Event Attendance',
                      data: [65, 59, 80, 81, 56, 55, 40],
                      fill: false,
                      borderColor: 'rgb(75, 192, 192)',
                      tension: 0.1
                    }
                  ]
                }}
              />
            </Box>
          </VStack>
        </TabPanel>

        <TabPanel>
          <TurtleEvents />
        </TabPanel>

        <TabPanel>
          <VirtualTurtleHabitat />
        </TabPanel>
      </TabPanels>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Avatar</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input type="file" />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Upload
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Tabs>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleLogin = (username, userId) => {
    setUser(username);
    setUserId(userId);
  };

  return (
    <ChakraProvider>
      <Router>
        <Container maxW="container.xl" py={10}>
          <VStack spacing={10}>
            <Heading as="h1" size="2xl">
              Virtual Event Manager
            </Heading>
            {user ? (
              <>
                <nav>
                  <Link to="/">Dashboard</Link>
                  <Link to="/turtle-events">Turtle Events</Link>
                  <Link to="/virtual-turtle-habitat">Virtual Turtle Habitat</Link>
                </nav>
                <Routes>
                  <Route path="/" element={<Dashboard username={user} userId={userId} />} />
                  <Route path="/turtle-events" element={<TurtleEvents />} />
                  <Route path="/virtual-turtle-habitat" element={<VirtualTurtleHabitat />} />
                </Routes>
              </>
            ) : (
              <>
                <VStack spacing={6} align="stretch" width="100%">
                  <Text fontSize="xl" textAlign="center">
                    Welcome! Please log in or register to access the Virtual Event Manager.
                  </Text>
                </VStack>
                <Auth onLogin={handleLogin} />
              </>
            )}
          </VStack>
        </Container>
      </Router>
    </ChakraProvider>
  );
}

export default App;
// Trigger deployment
