// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import clsx from "clsx";

import { Activity } from "~/components/Activity";
import { CurrentEpoch, OnTheNetwork } from "~/components/HomeMetrics";
import { PageLayout } from "~/components/Layout/PageLayout";
import { PolymediaCard } from "~/components/PolymediaCard";
import { ErrorBoundary } from "~/components/error-boundary/ErrorBoundary";
import { TopValidatorsCard } from "~/components/top-validators-card/TopValidatorsCard";
import { TabHeader } from "~/ui/Tabs";
import { Card } from "~/ui/Card";
import { TableCard } from "~/ui/TableCard";
import { TableHeader } from "~/ui/TableHeader";
import { AddressLink } from "~/ui/InternalLink";

// const ValidatorMap = lazy(() => import('../../components/validator-map'));

const TRANSACTIONS_LIMIT = 25;

function Home() {
	const isSuiTokenCardEnabled = false;
	// 主账户地址列表（示例数据）：
	const mainAccountsData = [
		{
			address: "0x0feb54a725aa357ff2f5bc6bb023c05b310285bd861275a30521f339a434ebb3",
			subTokenCount: 1000,
			subAddressCount: 10,
			subAddressCompletedCount: 5,
		},
		{
			address: "0xcde6dbe01902be1f200ff03dbbd149e586847be8cee15235f82750d9b06c0e04",
			subTokenCount: 500,
			subAddressCount: 5,
			subAddressCompletedCount: 3,
		},
		{
			address: "0xa9ebbc8a4e3ff8087ff40a5f7e65618b7500993a44f6c0bedebbfe78408309b9",
			subTokenCount: 200,
			subAddressCount: 2,
			subAddressCompletedCount: 1,
		},
	];
	const mainAccountsColumns = [
		{
			header: "地址",
			accessorKey: "address",
			cell: ({ getValue }: any) => <AddressLink address={getValue()} noTruncate />,
		},
		{
			header: "子账户token个数",
			accessorKey: "subTokenCount",
			enableSorting: true,
		},
		{
			header: "子账户地址个数",
			accessorKey: "subAddressCount",
			enableSorting: true,
		},
		{
			header: "已完成的子账户地址个数",
			accessorKey: "subAddressCompletedCount",
			enableSorting: true,
		},
	];
	return (
		<PageLayout
			gradient={{
				content: (
					<div
						data-testid="home-page"
						className={clsx("home-page-grid-container-top", isSuiTokenCardEnabled && "with-token")}
					>
						<div style={{ gridArea: "network" }} className="overflow-hidden">
							<OnTheNetwork />
						</div>
						<div style={{ gridArea: "epoch" }}>
							<CurrentEpoch />
						</div>
						{/*
						{isSuiTokenCardEnabled ? (
							<div style={{ gridArea: 'token' }}>
								<SuiTokenCard />
							</div>
						) : null}
						*/}
						{/* <div style={{ gridArea: "transactions" }}>
							<TransactionsCardGraph />
						</div> */}
						{/* <div style={{ gridArea: "accounts" }}>
							<AccountsCardGraph />
						</div> */}
						{/* <div style={{ gridArea: "polymedia" }}>
							<PolymediaCard />
						</div> */}
						<div style={{ gridArea: "polymedia" }}>
							<Card bg="white/80" border="gray45" spacing="lg">
								<TableHeader>主账户地址列表</TableHeader>
								<div className="mt-4">
									<TableCard sortTable data={mainAccountsData} columns={mainAccountsColumns} />
								</div>
							</Card>
						</div>
					</div>
				),
				size: "lg",
			}}
			content={
				<div className="home-page-grid-container-bottom">
					<div style={{ gridArea: "activity" }}>
						<ErrorBoundary>
							<Activity initialLimit={TRANSACTIONS_LIMIT} disablePagination />
						</ErrorBoundary>
					</div>
					{/* <div style={{ gridArea: "packages" }}>
						<TopPackagesCard />
					</div> */}
					<div data-testid="validators-table" style={{ gridArea: "validators" }}
					>
						<TabHeader title="Validators">
							<ErrorBoundary>
								<TopValidatorsCard limit={10} showIcon />
							</ErrorBoundary>
						</TabHeader>
					</div>
					{/*
					<div
						style={{ gridArea: 'node-map' }}
						className="min-h-[320px] sm:min-h-[380px] lg:min-h-[460px] xl:min-h-[520px]"
					>
						<ErrorBoundary>
							<Suspense fallback={<Card height="full" />}> 
								<ValidatorMap minHeight="100%" />
							</Suspense>
						</ErrorBoundary>
					</div>
					*/}
				</div>
			}
		/>
	);
}

export default Home;
