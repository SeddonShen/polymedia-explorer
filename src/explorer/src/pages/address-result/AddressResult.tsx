// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isSuiNSName, useResolveSuiNSAddress, useResolveSuiNSName } from "@mysten/core";
import { Domain32 } from "@mysten/icons";
import { LoadingIndicator, Button } from "@mysten/ui";
import { useParams } from "react-router-dom";
import { PageLayout } from "~/components/Layout/PageLayout";
import { OwnedCoins } from "~/components/OwnedCoins";
import { OwnedObjects } from "~/components/OwnedObjects";
import TransactionBlocksForAddress, { FILTER_VALUES } from "~/components/TransactionBlocksForAddress";
import { ErrorBoundary } from "~/components/error-boundary/ErrorBoundary";
import { useBreakpoint } from "~/hooks/useBreakpoint";
import { Divider } from "~/ui/Divider";
import { PageHeader } from "~/ui/PageHeader";
import { LOCAL_STORAGE_SPLIT_PANE_KEYS, SplitPanes } from "~/ui/SplitPanes";
import { TabHeader } from "~/ui/Tabs";
import { TotalStaked } from "./TotalStaked";
import { Card } from "~/ui/Card";
import { TableHeader } from "~/ui/TableHeader";
import { TableCard } from "~/ui/TableCard";
import { AddressLink, ObjectLink } from "~/ui/InternalLink";
import { Checkbox } from "~/ui/Checkbox";
import { Input } from "~/ui/Input";
import { useState } from "react";

const LEFT_RIGHT_PANEL_MIN_SIZE = 30;
const TOP_PANEL_MIN_SIZE = 20;

function AddressResultPageHeader({ address, loading }: { address: string; loading?: boolean }) {
	const { data: domainName, isLoading } = useResolveSuiNSName(address);

	return (
		<PageHeader
			loading={loading || isLoading}
			type="Address"
			title={address}
			subtitle={domainName}
			before={<Domain32 className="h-6 w-6 text-steel-darker sm:h-10 sm:w-10" />}
			after={<TotalStaked address={address} />}
		/>
	);
}

function SuiNSAddressResultPageHeader({ name }: { name: string }) {
	const { data: address, isLoading } = useResolveSuiNSAddress(name);

	return <AddressResultPageHeader address={address ?? name} loading={isLoading} />;
}

function AddressResult({ address }: { address: string }) {
	const isMediumOrAbove = useBreakpoint("md");

	// 子地址列表（示例数据：0x1 到 0x10）
	const subAddressesData = Array.from({ length: 10 }, (_, i) => ({
		address: `0x${i + 1}`,
		tokenCount: (i + 1) * 10,
		completed: i % 2 === 0,
		objectId: `0xobject${i + 1}`,
	}));

	const subAddressesColumns = [
		{
			header: "子地址",
			accessorKey: "address",
			cell: ({ getValue }: any) => <AddressLink address={getValue()} noTruncate />,
		},
		{
			header: "代币个数",
			accessorKey: "tokenCount",
			enableSorting: true,
		},
		{
			header: "是否已完成",
			accessorKey: "completed",
			cell: ({ getValue }: any) => (getValue() ? "已完成" : "未完成"),
			enableSorting: true,
		},
		{
			header: "Object ID",
			accessorKey: "objectId",
			cell: ({ getValue }: any) => <ObjectLink objectId={getValue()} noTruncate />,
		},
	];

	// 选择列用的状态
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const toggleSelect = (addr: string, checked: boolean) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(addr);
			} else {
				next.delete(addr);
			}
			return next;
		});
	};

	const selectableColumns = [
		{
			header: "选择",
			accessorKey: "select",
			cell: ({ row }: any) => {
				const addr = row.original.address as string;
				const checked = selected.has(addr);
				return (
					<Checkbox
						id={`chk-${addr}`}
						checked={checked}
						onCheckedChange={(value: boolean | "indeterminate") =>
							toggleSelect(addr, value === true)
						}
					/>
				);
			},
		},
		{
			header: "子地址",
			accessorKey: "address",
			cell: ({ getValue }: any) => <AddressLink address={getValue()} noTruncate />,
		},
		{
			header: "代币个数",
			accessorKey: "tokenCount",
			enableSorting: true,
		},
		{
			header: "是否已完成",
			accessorKey: "completed",
			cell: ({ getValue }: any) => (getValue() ? "已完成" : "未完成"),
			enableSorting: true,
		},
		{
			header: "Object ID",
			accessorKey: "objectId",
			cell: ({ getValue }: any) => <ObjectLink objectId={getValue()} noTruncate />,
		},
	];

	const [recipient, setRecipient] = useState("");
	const handleSend = () => {
		// 这里仅做演示，实际发送逻辑可对接链上操作
		console.log("Sending from sub-addresses:", Array.from(selected));
		console.log("Recipient:", recipient);
	};

	const leftPane = {
		panel: <OwnedCoins id={address} />,
		minSize: LEFT_RIGHT_PANEL_MIN_SIZE,
		defaultSize: LEFT_RIGHT_PANEL_MIN_SIZE,
	};

	const rightPane = {
		panel: <OwnedObjects id={address} />,
		minSize: LEFT_RIGHT_PANEL_MIN_SIZE,
	};

	const topPane = {
		panel: (
			<div className="flex h-full flex-col justify-between">
				<ErrorBoundary>
					{isMediumOrAbove ? (
						<SplitPanes
							autoSaveId={LOCAL_STORAGE_SPLIT_PANE_KEYS.ADDRESS_VIEW_HORIZONTAL}
							dividerSize="none"
							splitPanels={[leftPane, rightPane]}
							direction="horizontal"
						/>
					) : (
						<>
							{leftPane.panel}
							<div className="my-8">
								<Divider />
							</div>
							{rightPane.panel}
						</>
					)}
				</ErrorBoundary>
			</div>
		),
		minSize: TOP_PANEL_MIN_SIZE,
	};

	const bottomPane = {
		panel: (
			<div className="flex h-full flex-col pt-12">
				<ErrorBoundary>
					<div data-testid="tx" className="relative mt-4 h-full min-h-14 overflow-auto">
						<TransactionBlocksForAddress
							type="address"
							address={address}
							filter={FILTER_VALUES.FROM_ADDRESS}
							header="Transaction Blocks"
						/>
					</div>
				</ErrorBoundary>
			</div>
		),
	};

	return (
		<TabHeader title="Owned Objects" noGap>
			{/* 子地址列表卡片 */}
			<Card bg="white/80" border="gray45" spacing="lg">
				<TableHeader>子地址列表</TableHeader>
				<div className="mt-4">
					<TableCard sortTable data={subAddressesData} columns={subAddressesColumns} />
				</div>
			</Card>

			{/* 子地址批量选择与发送 */}
			<div className="mt-5">
				<Card bg="white/80" border="gray45" spacing="lg">
					<TableHeader>选择子地址并发送</TableHeader>
					<div className="mt-4">
						<TableCard sortTable data={subAddressesData} columns={selectableColumns} />
					</div>
					<div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
						<div className="flex-1">
							<Input
								label="接收方地址"
								placeholder="输入接收方地址"
								value={recipient}
								onChange={(e) => setRecipient(e.target.value)}
							/>
						</div>
						<div>
							<Button onClick={handleSend} disabled={!recipient || selected.size === 0}>
								发送
							</Button>
						</div>
					</div>
				</Card>
			</div>

			{isMediumOrAbove ? (
				<div className="h-300">
					<SplitPanes
						autoSaveId={LOCAL_STORAGE_SPLIT_PANE_KEYS.ADDRESS_VIEW_VERTICAL}
						dividerSize="none"
						splitPanels={[topPane, bottomPane]}
						direction="vertical"
					/>
				</div>
			) : (
				<>
					{topPane.panel}
					<div className="mt-5">
						<Divider />
					</div>
					{bottomPane.panel}
				</>
			)}
		</TabHeader>
	);
}

function SuiNSAddressResult({ name }: { name: string }) {
	const { isFetched, data } = useResolveSuiNSAddress(name);

	if (!isFetched) {
		return <LoadingIndicator />;
	}

	// Fall back into just trying to load the name as an address anyway:
	return <AddressResult address={data ?? name} />;
}

export default function AddressResultPage() {
	const { id } = useParams();
	const isSuiNSAddress = isSuiNSName(id!);

	return (
		<PageLayout
			gradient={{
				size: "md",
				content: isSuiNSAddress ? (
					<SuiNSAddressResultPageHeader name={id!} />
				) : (
					<AddressResultPageHeader address={id!} />
				),
			}}
			content={isSuiNSAddress ? <SuiNSAddressResult name={id!} /> : <AddressResult address={id!} />}
		/>
	);
}
