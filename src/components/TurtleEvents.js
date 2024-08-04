import React, { useState, useEffect } from 'react';
import {
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
  useToast,
  Textarea,
} from '@chakra-ui/react';
import axios from 'axios';

function TurtleEvents() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ name: '', description: '', date: '', location: '' });
  const toast = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('https://react-app-3nh3s87e.devinapps.com/turtle-events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching turtle events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch turtle events",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://react-app-3nh3s87e.devinapps.com/turtle-events', newEvent);
      fetchEvents();
      setNewEvent({ name: '', description: '', date: '', location: '' });
      toast({
        title: "Event created",
        description: "Your turtle event has been created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating turtle event:', error);
      toast({
        title: "Error",
        description: "Failed to create turtle event",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      await axios.post(`https://react-app-3nh3s87e.devinapps.com/turtle-events/${eventId}/rsvp`);
      toast({
        title: "RSVP Successful",
        description: "You have successfully RSVP'd to the event",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error RSVP\'ing to event:', error);
      toast({
        title: "Error",
        description: "Failed to RSVP to the event",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={5}>
      <Heading mb={6}>Turtle-Themed Events</Heading>

      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={3}>Create New Event</Heading>
          <form onSubmit={handleCreateEvent}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Event Name</FormLabel>
                <Input
                  name="name"
                  value={newEvent.name}
                  onChange={handleInputChange}
                  placeholder="Enter event name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  placeholder="Enter event description"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  name="date"
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Location</FormLabel>
                <Input
                  name="location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                  placeholder="Enter event location"
                />
              </FormControl>
              <Button type="submit" colorScheme="green">Create Event</Button>
            </VStack>
          </form>
        </Box>

        <Box>
          <Heading size="md" mb={3}>Upcoming Events</Heading>
          <List spacing={3}>
            {events.map((event) => (
              <ListItem key={event.id} p={3} shadow="md" borderWidth="1px">
                <Heading size="sm">{event.name}</Heading>
                <Text>Date: {new Date(event.date).toLocaleString()}</Text>
                <Text>Location: {event.location}</Text>
                <Text>{event.description}</Text>
                <Button mt={2} colorScheme="blue" size="sm" onClick={() => handleRSVP(event.id)}>
                  RSVP
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </VStack>
    </Box>
  );
}

export default TurtleEvents;
