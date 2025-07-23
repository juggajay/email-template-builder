'use client';

import React, { useState } from 'react';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  TemplateSkeleton,
  DashboardSkeleton,
  TableSkeleton,
  FormSkeleton,
  ListSkeleton,
  NavigationSkeleton,
  CardGridSkeleton,
  ProfileSkeleton,
} from '@/components/ui/skeletons';
import { 
  useSkeleton, 
  useProgressiveSkeleton, 
  useStaggeredSkeleton,
  useSmartSkeleton 
} from '@/hooks/use-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Demo component showcasing all skeleton variants
 */
export function SkeletonDemo() {
  const [showContent, setShowContent] = useState(false);
  const [selectedTab, setSelectedTab] = useState('basic');

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Skeleton Components Demo</h1>
        <p className="text-gray-600">
          A comprehensive skeleton loading system for better perceived performance
        </p>
        
        <Button
          onClick={() => setShowContent(!showContent)}
          variant="outline"
        >
          {showContent ? 'Show Skeletons' : 'Show Content'}
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <BasicSkeletons showContent={showContent} />
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <ComponentSkeletons showContent={showContent} />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <PatternSkeletons showContent={showContent} />
        </TabsContent>

        <TabsContent value="hooks" className="space-y-6">
          <HookExamples />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Basic skeleton examples
 */
function BasicSkeletons({ showContent }: { showContent: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Skeleton</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showContent ? (
            <>
              <div className="h-4 bg-gray-200 rounded">Content line 1</div>
              <div className="h-4 bg-gray-200 rounded">Content line 2</div>
              <div className="h-4 bg-gray-200 rounded w-3/4">Content line 3</div>
            </>
          ) : (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skeleton Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Default</p>
            <Skeleton className="h-12 w-full" />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Circular</p>
            <div className="flex gap-2">
              <Skeleton variant="circular" className="h-12 w-12" />
              <Skeleton variant="circular" className="h-8 w-8" />
              <Skeleton variant="circular" className="h-6 w-6" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Wave Animation</p>
            <Skeleton className="h-12 w-full" animation="wave" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Text Skeleton</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showContent ? (
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          ) : (
            <SkeletonText lines={3} lastLineWidth="60%" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avatar & Button</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <SkeletonAvatar size="sm" />
            <SkeletonAvatar size="md" />
            <SkeletonAvatar size="lg" />
            <SkeletonAvatar size="xl" />
          </div>
          
          <div className="flex gap-2">
            <SkeletonButton size="sm" />
            <SkeletonButton size="md" />
            <SkeletonButton size="lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Component skeleton examples
 */
function ComponentSkeletons({ showContent }: { showContent: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Template Card</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i}>
              {showContent ? (
                <Card>
                  <div className="aspect-video bg-gray-200 rounded-t-lg" />
                  <CardContent className="p-4">
                    <h4 className="font-semibold">Template {i}</h4>
                    <p className="text-sm text-gray-600">Template description</p>
                  </CardContent>
                </Card>
              ) : (
                <TemplateSkeleton />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Table</h3>
        {showContent ? (
          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i} className="border-b">
                    <td className="p-4">User {i}</td>
                    <td className="p-4">user{i}@example.com</td>
                    <td className="p-4">Active</td>
                    <td className="p-4">2024-01-0{i}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card>
            <TableSkeleton rows={3} columns={4} />
          </Card>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Form</h3>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>User Form</CardTitle>
          </CardHeader>
          <CardContent>
            {showContent ? (
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input className="w-full p-2 border rounded" />
                </div>
                <Button>Submit</Button>
              </form>
            ) : (
              <FormSkeleton fields={2} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Pattern skeleton examples
 */
function PatternSkeletons({ showContent }: { showContent: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Dashboard</h3>
        {showContent ? (
          <div>Dashboard content would go here</div>
        ) : (
          <DashboardSkeleton />
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Navigation</h3>
        {showContent ? (
          <div className="border rounded">Navigation content</div>
        ) : (
          <div className="border rounded">
            <NavigationSkeleton />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Profile</h3>
        {showContent ? (
          <div>Profile content would go here</div>
        ) : (
          <ProfileSkeleton />
        )}
      </div>
    </div>
  );
}

/**
 * Hook usage examples
 */
function HookExamples() {
  // Progressive loading example
  const { data, isLoading } = useProgressiveSkeleton(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { message: 'Data loaded!' };
    },
    []
  );

  // Staggered reveal example
  const items = [1, 2, 3, 4, 5];
  const { isItemRevealed, reset } = useStaggeredSkeleton(items.length, 200);

  // Smart skeleton example
  const [loading, setLoading] = useState(false);
  const showSkeleton = useSmartSkeleton(loading, 300);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progressive Loading</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonText lines={2} />
          ) : (
            <p>{data?.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staggered Reveal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item, index) => (
            <div key={item}>
              {isItemRevealed(index) ? (
                <div className="p-2 bg-gray-100 rounded">Item {item}</div>
              ) : (
                <Skeleton className="h-10 w-full" />
              )}
            </div>
          ))}
          <Button onClick={reset} size="sm" className="mt-2">
            Reset Animation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Smart Skeleton</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Only shows skeleton if loading takes longer than 300ms
          </p>
          <Button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Trigger Loading
          </Button>
          {showSkeleton && <SkeletonText lines={3} />}
        </CardContent>
      </Card>
    </div>
  );
}