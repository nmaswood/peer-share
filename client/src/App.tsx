import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Form from './components/Form';
import Room from './components/Room';
import RootLayout from './RootLayout';

const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		children: [
			{
				element: <Form />,
				path: '/',
			},
			{
				element: <Room />,
				path: '/room',
			},
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
