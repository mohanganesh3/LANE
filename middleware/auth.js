/**
 * Authentication Middleware
 * Protects routes and checks user roles
 */

const User = require('../models/User');

/**
 * Check if user is authenticated
 */
exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    
    // Store intended URL for redirect after login
    req.session.returnTo = req.originalUrl;
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    req.session.error = 'Please login to continue';
    res.redirect('/auth/login');
};

/**
 * Check if user is a rider
 */
exports.isRider = async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }
        
        if (user.role !== 'RIDER') {
            return res.status(403).render('pages/error', {
                title: 'Access Denied',
                message: 'This page is only accessible to riders. Please upgrade your account to become a rider.'
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in isRider middleware:', error);
        res.status(500).render('pages/error', {
            title: 'Server Error',
            message: 'An error occurred while checking your permissions'
        });
    }
};

/**
 * Check if user is a passenger
 */
exports.isPassenger = async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }
        
        if (user.role !== 'PASSENGER') {
            return res.status(403).render('pages/error', {
                title: 'Access Denied',
                message: 'This page is only accessible to passengers'
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in isPassenger middleware:', error);
        res.status(500).render('pages/error', {
            title: 'Server Error',
            message: 'An error occurred while checking your permissions'
        });
    }
};

/**
 * Check if user is an admin
 */
exports.isAdmin = async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }
        
        if (user.role !== 'ADMIN') {
            return res.status(403).render('pages/error', {
                title: 'Access Denied',
                message: 'This page is only accessible to administrators'
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Error in isAdmin middleware:', error);
        res.status(500).render('pages/error', {
            title: 'Server Error',
            message: 'An error occurred while checking your permissions'
        });
    }
};

/**
 * Check if rider is verified
 */
exports.isVerifiedRider = async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    
    try {
        const user = await User.findById(req.session.userId);
        
        if (!user) {
            req.session.destroy();
            return res.redirect('/auth/login');
        }
        
        if (user.role !== 'RIDER') {
            return res.status(403).render('pages/error', {
                title: 'Access Denied',
                message: 'This page is only accessible to riders. Please upgrade your account to become a rider.'
            });
        }
        
        if (user.verificationStatus !== 'VERIFIED') {
            return res.render('pages/under-process', {
                title: 'Verification Pending',
                status: user.verificationStatus,
                user: user
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Error checking verification:', error);
        res.status(500).render('pages/error', {
            title: 'Error',
            message: 'An error occurred while verifying your account'
        });
    }
};

/**
 * Check if user can access resource
 */
exports.canAccessResource = (resourceUserIdField) => {
    return (req, res, next) => {
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        
        // Admin can access everything
        if (req.session.user.role === 'ADMIN') {
            return next();
        }
        
        // User can access their own resources
        if (resourceUserId === req.session.user.id) {
            return next();
        }
        
        return res.status(403).render('pages/error', {
            title: 'Access Denied',
            message: 'You do not have permission to access this resource'
        });
    };
};

/**
 * Attach user object to request
 */
exports.attachUser = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId)
                .select('-password')
                .lean();
            
            if (user) {
                req.user = user;
                res.locals.currentUser = user;
            }
        } catch (error) {
            console.error('Error attaching user:', error);
        }
    }
    next();
};

/**
 * Check if user is not authenticated (for login/register pages)
 */
exports.isGuest = (req, res, next) => {
    if (req.session && req.session.userId) {
        return res.redirect('/user/dashboard');
    }
    next();
};
