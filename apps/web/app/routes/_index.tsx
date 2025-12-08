import { redirect } from 'react-router';

export async function loader() {
    return redirect('/chat');
}

export default function Index() {
    return null;
}
