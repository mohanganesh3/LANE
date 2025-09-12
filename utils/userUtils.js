const DEFAULT_AVATAR = '/images/default-avatar.png';

const sanitize = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'string') value = String(value);
    return value.trim();
};

const isMeaningful = (value) => {
    const s = sanitize(value);
    return s.length > 0 && !/undefined|null/i.test(s);
};

const capitalizeWords = (str) => sanitize(str).replace(/(?:^|\s)([a-z])/gi, (_, c) => c.toUpperCase());

const getEmailFallback = (email) => {
    if (!isMeaningful(email) || typeof email !== 'string') return '';
    const localPart = email.split('@')[0];
    if (!localPart) return '';
    return capitalizeWords(localPart.replace(/[._-]+/g, ' '));
};

const getPhoneFallback = (phone) => {
    if (!isMeaningful(phone)) return '';
    const digits = phone.toString().replace(/\D+/g, '');
    if (!digits) return '';
    return digits.length >= 4 ? `User • ${digits.slice(-4)}` : `User • ${digits}`;
};

const computeDisplayName = (user) => {
    if (!user || typeof user !== 'object') return 'Unknown User';

    const profile = user.profile || {};
    const firstName = sanitize(profile.firstName || user.firstName);
    const lastName = sanitize(profile.lastName || user.lastName);
    const fullName = [firstName, lastName].filter(isMeaningful).join(' ').trim();

    if (isMeaningful(fullName)) return capitalizeWords(fullName);
    if (isMeaningful(user.displayName)) return capitalizeWords(user.displayName);
    if (isMeaningful(user.fullName)) return capitalizeWords(user.fullName);
    if (isMeaningful(user.name)) return capitalizeWords(user.name);

    const emailFallback = getEmailFallback(user.email);
    if (isMeaningful(emailFallback)) return emailFallback;

    const phoneFallback = getPhoneFallback(user.phone || user.phoneNumber);
    if (isMeaningful(phoneFallback)) return phoneFallback;

    if (user._id) {
        const id = sanitize(user._id);
        if (id) return `User • ${id.slice(-4)}`;
    }

    return 'Unknown User';
};

const computeProfilePhoto = (user) => {
    if (!user || typeof user !== 'object') return DEFAULT_AVATAR;
    const profile = user.profile || {};
    const candidates = [
        profile.photo,
        user.profilePhoto,
        user.photo,
        user.avatar,
        user.profile_picture,
        user.picture,
        user.image,
        DEFAULT_AVATAR
    ];
    const chosen = candidates.find(isMeaningful);
    return chosen || DEFAULT_AVATAR;
};

const computeInitials = (name) => {
    const parts = sanitize(name).split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    const initials = parts.slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('');
    return initials || 'U';
};

const decorateUser = (user) => {
    if (!user || typeof user !== 'object') return user;

    const name = computeDisplayName(user);
    const photo = computeProfilePhoto(user);

    if (!isMeaningful(user.name)) user.name = name;
    user.displayName = name;
    user.fullName = name;
    user.safeName = name;
    user.profilePhoto = photo;
    user.avatar = photo;
    user.photo = user.photo || photo;
    user.initials = computeInitials(name);

    if (!user.profile || typeof user.profile !== 'object') {
        user.profile = { firstName: name.split(' ')[0] || name, lastName: name.split(' ')[1] || '' };
    } else {
        if (!isMeaningful(user.profile.firstName)) {
            const [first] = name.split(' ');
            if (first) user.profile.firstName = first;
        }
        if (!isMeaningful(user.profile.lastName)) {
            const [, ...rest] = name.split(' ');
            if (rest.length) user.profile.lastName = rest.join(' ');
        }
        if (!isMeaningful(user.profile.photo)) {
            user.profile.photo = photo;
        }
    }

    return user;
};

const isUserLike = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    if (Array.isArray(obj)) return false;

    const keys = Object.keys(obj);
    if (!keys.includes('_id')) return false;

    return keys.includes('role') || keys.includes('email') || keys.includes('phone') || keys.includes('profile') || keys.includes('verificationStatus') || keys.includes('preferences');
};

const enrichUsers = (value, seen = new WeakSet()) => {
    if (value === null || value === undefined) return value;

    if (typeof value !== 'object') return value;

    if (seen.has(value)) return value;
    seen.add(value);

    if (Array.isArray(value)) {
        value.forEach(item => enrichUsers(item, seen));
        return value;
    }

    if (isUserLike(value)) {
        decorateUser(value);
    }

    Object.keys(value).forEach((key) => {
        const child = value[key];
        if (child && typeof child === 'object') {
            enrichUsers(child, seen);
        }
    });

    return value;
};

const getUserDisplay = (userObj) => {
    const decorated = decorateUser({ ...(userObj || {}) });
    return {
        name: decorated.displayName,
        photo: decorated.profilePhoto,
        initials: decorated.initials
    };
};

module.exports = {
    DEFAULT_AVATAR,
    computeDisplayName,
    computeProfilePhoto,
    computeInitials,
    decorateUser,
    enrichUsers,
    getUserDisplay
};
