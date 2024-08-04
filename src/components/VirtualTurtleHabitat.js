import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Image, Button, VStack, HStack, useToast } from '@chakra-ui/react';

const VirtualTurtleHabitat = () => {
  const [turtleHealth, setTurtleHealth] = useState(100);
  const [habitatCleanliness, setHabitatCleanliness] = useState(100);
  const [showInfo, setShowInfo] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTurtleHealth(prevHealth => Math.max(prevHealth - 1, 0));
      setHabitatCleanliness(prevCleanliness => Math.max(prevCleanliness - 2, 0));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const feedTurtle = () => {
    setTurtleHealth(prevHealth => Math.min(prevHealth + 10, 100));
    toast({
      title: "Turtle fed",
      description: "Your turtle is happy and healthy!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const cleanHabitat = () => {
    setHabitatCleanliness(100);
    toast({
      title: "Habitat cleaned",
      description: "The habitat is now sparkling clean!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const toggleInfo = () => setShowInfo(!showInfo);

  return (
    <Box borderWidth={1} borderRadius="lg" overflow="hidden" p={4}>
      <Heading as="h2" size="xl" mb={4}>Virtual Turtle Habitat</Heading>

      <HStack spacing={4} mb={4}>
        <VStack align="start">
          <Text>Turtle Health: {turtleHealth}%</Text>
          <Text>Habitat Cleanliness: {habitatCleanliness}%</Text>
        </VStack>
        <Image src="https://example.com/turtle-habitat.jpg" alt="Turtle Habitat" boxSize="200px" objectFit="cover" />
      </HStack>

      <HStack spacing={4} mb={4}>
        <Button colorScheme="green" onClick={feedTurtle}>Feed Turtle</Button>
        <Button colorScheme="blue" onClick={cleanHabitat}>Clean Habitat</Button>
        <Button colorScheme="purple" onClick={toggleInfo}>
          {showInfo ? "Hide Info" : "Show Info"}
        </Button>
      </HStack>

      {showInfo && (
        <Box borderWidth={1} borderRadius="md" p={4} bg="gray.50">
          <Text>
            Turtles are fascinating creatures that require proper care in captivity.
            Ensure a clean habitat, proper nutrition, and regular health checks for your virtual turtle.
            In the wild, turtles play crucial roles in ecosystems, from seed dispersal to maintaining coral reef health.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default VirtualTurtleHabitat;
