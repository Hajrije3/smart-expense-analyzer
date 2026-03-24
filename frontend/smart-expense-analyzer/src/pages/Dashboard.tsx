import Layout from "../components/Layout";

const Dashboard = () => {

    return (
        <Layout>
            <div className="p-6 space-y-6">

                {/* HEADER */}
                <div>
                    <h1 className="text-3xl font-bold">
                        Welcome back, {JSON.parse(localStorage.getItem("user") || "{}")?.name || "User"}
                    </h1>
                    <p className="text-gray-500">
                        Here's what's happening with your finances today.
                    </p>
                </div>

                {/* CARDS */}
                <div className="grid grid-cols-4 gap-6">

                    <div className="bg-white p-6 rounded-xl shadow">
                        <p className="text-gray-500">Total Balance</p>
                        <h2 className="text-2xl font-bold">$12,345</h2>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow">
                        <p className="text-gray-500">Monthly Spending</p>
                        <h2 className="text-2xl font-bold">$1,476</h2>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow">
                        <p className="text-gray-500">Savings Rate</p>
                        <h2 className="text-2xl font-bold">67%</h2>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow">
                        <p className="text-gray-500">Budget Status</p>
                        <h2 className="text-2xl font-bold">73%</h2>
                    </div>

                </div>


            </div>
        </Layout>
    );
};

export default Dashboard;