import React from "react";
import translate from '@ff-client/utils/translations';
import { formSelectors } from "@editor/store/slices/form/form.selectors";
import {
    SectionWrapper,
    SidebarSeperator,
    SidebarMeta,
    SidebarMetaUserLink
} from './settings.sidebar.styles';
import {useSelector} from "react-redux";

export const SettingsOwnership: React.FC = ({ }) => {
	const { ownership } = useSelector(formSelectors.current);

	if (!ownership) {
		return null;
	}

	console.log(ownership);

	return (
		<>
			<SidebarSeperator />
			<SectionWrapper>
				<SidebarMeta>
					{ ownership.created.user ? (
						<>
							{ translate('Created by') } <SidebarMetaUserLink href={ownership.created.user.url} target="_blank">{ ownership.created.user.name }</SidebarMetaUserLink>
						</>
					) : (
						translate('Created')
					) }
					&nbsp;
					{translate('at')}:<br/> { ownership.created.datetime }
				</SidebarMeta>

				<SidebarMeta>
					{ ownership.updated.user ? (
						<>
							{ translate('Last Updated by') } <SidebarMetaUserLink href={ownership.updated.user.url} target="_blank">{ ownership.updated.user.name }</SidebarMetaUserLink>
						</>
					) : (
						translate('Last Updated')
					) }
					&nbsp;
					{translate('at')}:<br/> { ownership.updated.datetime }
				</SidebarMeta>
			</SectionWrapper>
		</>
	);
}