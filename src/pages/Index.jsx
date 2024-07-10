import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { readFileAsText } from "@/utils/fileReader";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [availableDomains, setAvailableDomains] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      readFileAsText(file).then((text) => {
        setUploadedFile(text.split("\n").map((line) => line.trim()));
      });
    }
  };

  const fetchAvailableDomains = ({ pageParam = 0 }) => {
    const pageSize = 50;
    const start = pageParam * pageSize;
    const end = start + pageSize;
    return availableDomains.slice(start, end);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["availableDomains", uploadedFile],
    queryFn: fetchAvailableDomains,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === 50) {
        return allPages.length;
      }
      return undefined;
    },
    enabled: !!uploadedFile,
  });

  const handleCompare = () => {
    fetch("/src/data/words.txt")
      .then((response) => response.text())
      .then((dictionaryText) => {
        const dictionaryWords = dictionaryText.split("\n").map((word) => word.trim());
        const available = dictionaryWords.filter((word) => !uploadedFile.includes(word));
        setAvailableDomains(available);
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Available 1-word .xyz Domains</h1>
        <p className="text-lg">Upload a list of registered XYZ domains to find available ones.</p>
      </header>

      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Registered XYZ Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="file" accept=".txt" onChange={handleFileUpload} />
            <Button onClick={handleCompare} className="mt-4">Compare</Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Available Domains</h2>
        <div className="overflow-auto h-96 border p-4">
          {data?.pages.map((page, pageIndex) => (
            <React.Fragment key={pageIndex}>
              {page.map((domain, domainIndex) => (
                <p key={domainIndex}>{domain}.xyz</p>
              ))}
            </React.Fragment>
          ))}
          {isFetchingNextPage && <p>Loading more...</p>}
          {!hasNextPage && <p>No more domains available.</p>}
        </div>
        {hasNextPage && (
          <Button onClick={() => fetchNextPage()} className="mt-4">
            Load More
          </Button>
        )}
      </section>
    </div>
  );
};

export default Index;