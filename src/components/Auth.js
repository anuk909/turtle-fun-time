import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import axios from 'axios';

function Auth({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tabIndex === 0) {
        const response = await axios.post('https://your-deployed-backend-url.com/login', { username, password });
        if (response.data.success) {
          onLogin(username, response.data.userId);
        }
      } else {
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
        const response = await axios.post('https://your-deployed-backend-url.com/register', { username, password, email });
        if (response.data.id) {
          toast({
            title: "Registration successful",
            description: "You can now log in with your credentials",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          setTabIndex(0);
        }
      }
    } catch (error) {
      toast({
        title: tabIndex === 0 ? "Login failed" : "Registration failed",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTabsChange = (index) => {
    setTabIndex(index);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
  };

  return (
    <Tabs isFitted variant="enclosed" index={tabIndex} onChange={handleTabsChange}>
      <TabList mb="1em">
        <Tab>Login</Tab>
        <Tab>Register</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <form onSubmit={handleSubmit}>
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
          <form onSubmit={handleSubmit}>
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

export default Auth;
