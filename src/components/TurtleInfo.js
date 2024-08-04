import React from 'react';
import { Box, Heading, Text, Image, SimpleGrid, Button, useColorModeValue } from '@chakra-ui/react';

const turtleSpecies = [
  { name: 'Green Sea Turtle', image: 'https://example.com/green-sea-turtle.jpg', description: 'Known for their green-colored fat, these turtles are herbivores and can be found in tropical and subtropical waters.' },
  { name: 'Loggerhead Turtle', image: 'https://example.com/loggerhead-turtle.jpg', description: 'Named for their large heads, these turtles are found in oceans around the world and are known for their powerful jaws.' },
  { name: 'Leatherback Turtle', image: 'https://example.com/leatherback-turtle.jpg', description: 'The largest of all living turtles, leatherbacks are known for their unique shell structure and their ability to dive to great depths.' },
];

const TurtleInfo = () => {
  const bgColor = useColorModeValue('green.50', 'green.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box bg={bgColor} color={textColor} p={8} borderRadius="lg">
      <Heading as="h2" size="xl" mb={6}>Discover the World of Turtles</Heading>
      
      <Text fontSize="lg" mb={6}>
        Turtles are fascinating creatures that have been around for millions of years. They play a crucial role in maintaining the health of our ecosystems, from beaches to coral reefs.
      </Text>

      <Heading as="h3" size="lg" mb={4}>Meet Some Turtle Species</Heading>
      <SimpleGrid columns={[1, null, 3]} spacing={10}>
        {turtleSpecies.map((species, index) => (
          <Box key={index} borderWidth={1} borderRadius="lg" overflow="hidden">
            <Image src={species.image} alt={species.name} />
            <Box p={4}>
              <Heading as="h4" size="md" mb={2}>{species.name}</Heading>
              <Text>{species.description}</Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      <Box mt={10}>
        <Heading as="h3" size="lg" mb={4}>Conservation Efforts</Heading>
        <Text mb={4}>
          Many turtle species are endangered due to habitat loss, pollution, and climate change. You can help protect turtles by:
        </Text>
        <ul>
          <li>Reducing plastic use to keep oceans clean</li>
          <li>Supporting turtle conservation organizations</li>
          <li>Being mindful of nesting areas when visiting beaches</li>
        </ul>
        <Button colorScheme="green" mt={4} onClick={() => window.open('https://www.seaturtles.org/', '_blank')}>
          Learn More About Conservation
        </Button>
      </Box>
    </Box>
  );
};

export default TurtleInfo;
