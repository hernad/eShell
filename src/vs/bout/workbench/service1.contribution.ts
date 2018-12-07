import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';

import { Registry } from 'vs/platform/registry/common/platform';
import { Service1BrowserClient } from 'vs/bout/workbench/electron-browser/service1BrowserClient';
import { LifecyclePhase } from 'vs/platform/lifecycle/common/lifecycle';

// ne kontam
Registry
	.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench)
	.registerWorkbenchContribution(Service1BrowserClient, LifecyclePhase.Eventually);