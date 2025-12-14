import React, { useState, useEffect } from 'react';
import {
    ChevronDown,
    ChevronRight,
    CheckSquare,
    Square,
    Edit2,
    Trash2,
    Plus,
    Eye,
    Folder,
    File,
    Zap
} from 'lucide-react';

const PermissionTree = ({ permissions, selectedPermissions, setSelectedPermissions }) => {
    const [expandedSections, setExpandedSections] = useState({
        menuGroups: true,
        menus: true,
        actions: true
    });
    const [expandedMenuGroups, setExpandedMenuGroups] = useState({});
    const [expandedMenus, setExpandedMenus] = useState({});

    useEffect(() => {
        if (permissions && permissions.length > 0) {
            const menuGroups = permissions.filter(p => p.permission_type === 'menu_group');
            const menus = permissions.filter(p => p.permission_type === 'menu');

            const initialExpandedGroups = {};
            menuGroups.forEach(group => {
                initialExpandedGroups[group.permission_code] = true;
            });
            setExpandedMenuGroups(initialExpandedGroups);

            const initialExpandedMenus = {};
            menus.forEach(menu => {
                initialExpandedMenus[menu.permission_code] = true;
            });
            setExpandedMenus(initialExpandedMenus);
        }
    }, [permissions]);

    const getActionIcon = (permCode) => {
        if (permCode.includes('create')) return Plus;
        if (permCode.includes('edit')) return Edit2;
        if (permCode.includes('delete')) return Trash2;
        if (permCode.includes('view')) return Eye;
        return Zap;
    };

    const menuGroups = permissions.filter(p => p.permission_type === 'menu_group');
    const menus = permissions.filter(p => p.permission_type === 'menu');
    const actions = permissions.filter(p => p.permission_type === 'action');

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const isSelected = (permId) => selectedPermissions.includes(permId);

    const handleToggle = (permId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permId)) {
                return prev.filter(id => id !== permId);
            } else {
                return [...prev, permId];
            }
        });
    };

    const renderPermission = (perm, Icon, level = 0, canHaveChildren = false) => {
        const selected = isSelected(perm.id);

        // Eğer menu ise, child action'ları bul
        const children = canHaveChildren && perm.permission_type === 'menu'
            ? actions.filter(a => a.parent_code === perm.permission_code)
            : [];

        const isExpanded = expandedMenus[perm.permission_code] || false;

        const toggleExpand = () => {
            setExpandedMenus(prev => ({
                ...prev,
                [perm.permission_code]: !prev[perm.permission_code]
            }));
        };

        return (
            <div key={perm.id}>
                <div
                    className="permission-item"
                    style={{ paddingLeft: `${level * 20}px` }}
                >
                    {children.length > 0 && (
                        <button
                            className="expand-btn"
                            onClick={toggleExpand}
                        >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}
                    {children.length === 0 && canHaveChildren && <span className="expand-spacer"></span>}

                    <button className="checkbox-btn" onClick={() => handleToggle(perm.id)}>
                        {selected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>

                    <div className="permission-icon">
                        <Icon size={16} />
                    </div>

                    <div className="permission-label">
                        <span className="permission-desc">{perm.description}</span>
                        <span className="permission-code">{perm.permission_code}</span>
                    </div>
                </div>

                {isExpanded && children.length > 0 && (
                    <div className="permission-children">
                        {children.map(action => {
                            const ActionIcon = getActionIcon(action.permission_code);
                            return renderPermission(action, ActionIcon, level + 1, false);
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderMenuGroupHierarchy = (group) => {
        const isExpanded = expandedMenuGroups[group.permission_code] || false;
        const children = menus.filter(m => m.parent_code === group.permission_code);
        const selected = isSelected(group.id);

        const toggleExpand = () => {
            setExpandedMenuGroups(prev => ({
                ...prev,
                [group.permission_code]: !prev[group.permission_code]
            }));
        };

        return (
            <div key={group.id} className="hierarchy-node">
                <div className="permission-item">
                    {children.length > 0 && (
                        <button className="expand-btn" onClick={toggleExpand}>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}
                    {children.length === 0 && <span className="expand-spacer"></span>}

                    <button className="checkbox-btn" onClick={() => handleToggle(group.id)}>
                        {selected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>

                    <div className="permission-icon">
                        <Folder size={16} />
                    </div>

                    <div className="permission-label">
                        <span className="permission-desc">{group.description}</span>
                        <span className="permission-code">{group.permission_code}</span>
                    </div>
                </div>

                {isExpanded && children.length > 0 && (
                    <div className="permission-children">
                        {children.map(menu => renderPermission(menu, File, 1, true))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="permission-tree">
            <div className="permission-section">
                <button className="section-header" onClick={() => toggleSection('menuGroups')}>
                    {expandedSections.menuGroups ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <Folder size={18} />
                    <span>Menü Grupları</span>
                    <span className="section-count">({menuGroups.length})</span>
                </button>

                {expandedSections.menuGroups && (
                    <div className="section-content">
                        {menuGroups.map(group => renderMenuGroupHierarchy(group))}
                    </div>
                )}
            </div>

            <div className="permission-section">
                <button className="section-header" onClick={() => toggleSection('menus')}>
                    {expandedSections.menus ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <File size={18} />
                    <span>Tek Başına Menüler</span>
                    <span className="section-count">({menus.filter(m => !m.parent_code).length})</span>
                </button>

                {expandedSections.menus && (
                    <div className="section-content">
                        {menus
                            .filter(m => !m.parent_code)
                            .map(menu => renderPermission(menu, File, 0, true))}
                    </div>
                )}
            </div>

            <div className="permission-section">
                <button className="section-header" onClick={() => toggleSection('actions')}>
                    {expandedSections.actions ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <Zap size={18} />
                    <span>Aksiyonlar</span>
                    <span className="section-count">({actions.length})</span>
                </button>

                {expandedSections.actions && (
                    <div className="section-content">
                        {actions.map(action => {
                            const ActionIcon = getActionIcon(action.permission_code);
                            return renderPermission(action, ActionIcon);
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermissionTree;